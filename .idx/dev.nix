# To learn more about how to use Nix to configure your environment
# see: https://developers.google.com/idx/guides/customize-idx-env
{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-24.05"; # or "unstable"
  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.nodejs_20
  ];
  # Sets environment variables in the workspace
  env = {
    REACT_APP_FIREBASE_API_KEY = "YOUR_API_KEY";
    REACT_APP_FIREBASE_AUTH_DOMAIN = "YOUR_AUTH_DOMAIN";
    REACT_APP_FIREBASE_PROJECT_ID = "YOUR_PROJECT_ID";
    REACT_APP_FIREBASE_STORAGE_BUCKET = "YOUR_STORAGE_BUCKET";
    REACT_APP_FIREBASE_MESSAGING_SENDER_ID = "YOUR_MESSAGING_SENDER_ID";
    REACT_APP_FIREBASE_APP_ID = "YOUR_APP_ID";
  };
  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      # "vscodevim.vim"
    ];
    workspace = {
      # Runs when a workspace is first created with this `dev.nix` file
      onCreate = {
        npm-install = "npm ci --no-audit --prefer-offline --no-progress --timing";
        # Open editors for the following files by default, if they exist:
        default.openFiles = [ "src/App.tsx" "src/App.ts" "src/App.jsx" "src/App.js" ];
      };
      # To run something each time the workspace is (re)started, use the `onStart` hook
    };
    # Enable previews and customize configuration
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm" "run" "dev" "--" "--port" "$PORT" "--host" "0.0.0.0"];
          manager = "web";
        };
      };
    };
  };
}
