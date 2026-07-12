"""
ai_engine.py
------------
Handles all interaction with the local, offline LLM (llama.cpp + GGUF)
for NeuroNest. This module has no knowledge of Flask, routes, or the
database — it only knows how to verify paths and run llama-cli.exe as a
subprocess to generate text.

Design notes:
- The model is never loaded into a persistent in-memory process here.
  Each call to generate_response() spawns a short-lived llama-cli.exe
  process, which loads the GGUF file itself, generates, and exits.
- Global state is limited to two resolved Path objects: the model file
  path and the llama-cli.exe executable path.
"""

import logging
import subprocess
from pathlib import Path
from typing import Optional
from unittest import result

logger = logging.getLogger(__name__)

# Directory this file lives in — used to locate llama-cli.exe relative
# to the project, without any hardcoded absolute paths.
BASE_DIR = Path(__file__).resolve().parent

# Expected location: Backend/llama.cpp/llama-cli.exe
EXECUTABLE_PATH: Path = BASE_DIR / "llama.cpp" / "llama-cli.exe"

# Generation timeout, in seconds.
GENERATION_TIMEOUT_SECONDS = 60

# ---------------------------------------------------------------------
# Module-level state.
# Populated by load_model(); read by generate_response()/is_model_loaded().
# This is intentionally the only mutable global state in this module.
# ---------------------------------------------------------------------
_model_path: Optional[Path] = None
_executable_path: Optional[Path] = None


def load_model(model_path: str | Path) -> None:
    """
    Verify that the GGUF model file and the llama-cli.exe executable
    both exist, and store their resolved paths for later use.

    This does NOT load the model into memory — llama.cpp loads the model
    fresh inside each subprocess spawned by generate_response().

    Args:
        model_path: Path to the .gguf model file.

    Raises:
        FileNotFoundError: If the model file or llama-cli.exe is missing.
    """
    global _model_path, _executable_path

    resolved_model_path = Path(model_path).resolve()

    if not resolved_model_path.is_file():
        raise FileNotFoundError(
            f"GGUF model file not found at: {resolved_model_path}"
        )

    if not EXECUTABLE_PATH.is_file():
        raise FileNotFoundError(
            f"llama-cli.exe not found at: {EXECUTABLE_PATH}. "
            "Make sure the llama.cpp binaries are placed in Backend/llama.cpp/."
        )

    _model_path = resolved_model_path
    _executable_path = EXECUTABLE_PATH

    message = f"AI engine ready — model loaded from: {_model_path.name}"
    logger.info(message)
    print(message)


def is_model_loaded() -> bool:
    """
    Return True if load_model() has been called successfully and both
    required paths are known, False otherwise.
    """
    return _model_path is not None and _executable_path is not None


def generate_response(prompt: str) -> str:
    """
    Run llama-cli.exe as a subprocess with the given prompt and return
    the generated text.

    Args:
        prompt: The text prompt to send to the model.

    Returns:
        The model's generated response, as a plain string.

    Raises:
        RuntimeError: If the model isn't loaded, generation fails,
                      or the process times out.
    """
    if not is_model_loaded():
        raise RuntimeError(
            "AI model is not loaded. Call load_model() before generating text."
        )

    # No interactive mode, no streaming — a single prompt in, one
    # response out. shell=False avoids shell-injection risk entirely.
    command = [
    str(_executable_path),
    "-m", str(_model_path),
    "-st",
    "-p", prompt,
]

    logger.info("Starting text generation.")

    try:
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=GENERATION_TIMEOUT_SECONDS,
            shell=False,
        )
    except subprocess.TimeoutExpired as error:
        logger.error("Text generation timed out after %s seconds.", GENERATION_TIMEOUT_SECONDS)
        raise RuntimeError(
            f"Generation timed out after {GENERATION_TIMEOUT_SECONDS} seconds."
        ) from error
    except OSError as error:
        logger.error("Failed to start llama-cli.exe: %s", error)
        raise RuntimeError(f"Failed to start llama-cli.exe: {error}") from error

    if result.returncode != 0:
        logger.error("llama-cli.exe exited with code %s: %s", result.returncode, result.stderr)
        raise RuntimeError(
            f"Text generation failed (exit code {result.returncode}): {result.stderr.strip()}"
        )
    
    print("\n========== RAW STDOUT ==========")
    print(result.stdout)
    print("================================\n")   
    response_text = _extract_response(result.stdout, prompt)

    if not response_text:
        logger.error("llama-cli.exe produced no usable output.")
        raise RuntimeError("Text generation produced no output.")

    logger.info("Text generation completed successfully.")
    return response_text


def _extract_response(raw_output: str, prompt: str) -> str:
    """
    Clean up llama-cli.exe's raw stdout so only the generated response
    text is returned — banners, model info, the full (possibly
    multi-line) echoed prompt, the trailing timing line, and the
    "Exiting..." line are all removed.

    Expected raw shape:
        <banner / model info>
        > <prompt line 1>
        <prompt line 2>
        <prompt line 3...>
        <assistant's actual response, possibly multiple lines>
        [ Prompt: ... | Generation: ... ]
        Exiting...
    """
    lines = raw_output.splitlines()

    # Find the line where the prompt echo begins (starts with "> ").
    # Everything before this is startup banner/model info — ignore it.
    start_index = None
    for i, line in enumerate(lines):
        if line.startswith("> "):
            start_index = i
            break

    if start_index is None:
        # Fallback: no "> " marker found — best effort prefix strip.
        cleaned = raw_output.strip()
        if cleaned.startswith(prompt):
            cleaned = cleaned[len(prompt):]
        return cleaned.strip()

    remaining_lines = lines[start_index:]

    # Strip the "> " marker from the first line, leaving the first
    # line of the actual echoed prompt text in place.
    if remaining_lines and remaining_lines[0].startswith("> "):
        remaining_lines[0] = remaining_lines[0][2:]

    # The prompt we sent can itself span many lines (instructions,
    # habit lists, etc). Walk both the echoed output and our own prompt
    # line-by-line, dropping every line that matches — this removes the
    # entire echoed prompt block regardless of how many lines it has.
    prompt_lines = prompt.splitlines()
    idx = 0
    while (
        idx < len(remaining_lines)
        and idx < len(prompt_lines)
        and remaining_lines[idx].strip() == prompt_lines[idx].strip()
    ):
        idx += 1

    response_lines = remaining_lines[idx:]

    # Remove trailing junk: timing stats ("[ Prompt: ... ]") and the
    # final "Exiting..." line llama-cli prints on shutdown.
    while response_lines:
        last = response_lines[-1].strip()
        if last.startswith("[") or last.lower().startswith("exiting"):
            response_lines.pop()
        else:
            break

    # Drop leading/trailing blank lines, but keep blank lines that
    # separate paragraphs within the response itself.
    while response_lines and response_lines[0].strip() == "":
        response_lines.pop(0)
    while response_lines and response_lines[-1].strip() == "":
        response_lines.pop()

    response = "\n".join(response_lines).strip()

    # Remove timing statistics if they appear anywhere in the response
    if "[ Prompt:" in response:
        response = response.split("[ Prompt:")[0].rstrip()

    # Remove "Exiting..." if it somehow remains
    if "Exiting..." in response:
        response = response.split("Exiting...")[0].rstrip()

    return response

def cleanup() -> None:
    """
    Placeholder for future cleanup logic (e.g. releasing resources if
    this module is later changed to hold a persistent model process).
    Currently there is nothing to clean up, since each generation runs
    in its own short-lived subprocess.
    """
    logger.info("cleanup() called — no persistent resources to release.")
