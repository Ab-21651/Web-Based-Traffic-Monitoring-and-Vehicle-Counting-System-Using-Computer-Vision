"""
Main entry point for the Detection & Tracking pipeline.
Orchestrates validation, logging setup, and pipeline execution.
"""

import sys
import traceback

import config
from debug_logger import logger
from detector_tracker import create_tracker
from validator import validate


def print_test_mode_banner():
    """Print banner when TEST_MODE is active."""
    banner = (
        "\n" + "=" * 70 + "\n"
        "[TEST MODE] Running on first 100 frames only\n"
        "=" * 70 + "\n"
    )
    print(banner)


def main():
    """Main pipeline orchestration."""
    try:
        # Pre-run validation
        validate()

        # Log system information
        logger.log_system_info()

        # Print TEST_MODE banner if active
        if config.TEST_MODE:
            print_test_mode_banner()

        # Create and load tracker
        logger.log_info("Initializing detection & tracking pipeline...")
        tracker = create_tracker()

        # Process video
        logger.log_info(f"Processing video: {config.INPUT_VIDEO}")
        tracker.process_video(
            config.INPUT_VIDEO,
            config.OUTPUT_VIDEO,
            config.OUTPUT_JSON
        )

        # Print completion summary
        avg_inference = sum(tracker.inference_times) / len(tracker.inference_times) if tracker.inference_times else 0
        logger.log_completion(
            tracker.total_frames_processed,
            len(tracker.unique_vehicle_ids),
            avg_inference,
            config.OUTPUT_VIDEO,
            config.OUTPUT_JSON
        )

        logger.log_info("[DONE] Pipeline completed successfully")
        return 0

    except KeyboardInterrupt:
        logger.log_warning("Pipeline interrupted by user")
        return 1
    except Exception as e:
        error_msg = f"Fatal error in pipeline: {e}\n{traceback.format_exc()}"
        logger.log_error(error_msg)
        print(f"\n[FAIL] Pipeline failed. Check {config.DEBUG_LOG} for details.")
        return 1


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
