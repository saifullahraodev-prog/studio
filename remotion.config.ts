import { Config } from "@remotion/cli/config";

// Hardware-friendly defaults. Override per command with --gl / --concurrency.
// GL mode is chosen in Phase 1 from the WebGL test results (see PROGRESS.md).
Config.setChromiumOpenGlRenderer("angle");
Config.setConcurrency(2);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
