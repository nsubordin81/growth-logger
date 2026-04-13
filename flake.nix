{
  description = "Growth Logger — personal development field journal";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_20
          ];

          shellHook = ''
            echo "⬛ Growth Logger dev environment"
            echo "  node $(node --version)  |  npm $(npm --version)"
            echo ""
            echo "  npm install   — install deps"
            echo "  npm run dev   — start at http://localhost:3000"
            echo ""
          '';
        };

        # Optional: nix build produces a standalone Next.js server
        packages.default = pkgs.buildNpmPackage {
          pname = "growth-logger";
          version = "0.1.0";
          src = ./.;

          npmDepsHash = pkgs.lib.fakeHash;  # run `nix build` once to get the real hash

          buildPhase = ''
            npm run build
          '';

          installPhase = ''
            mkdir -p $out
            cp -r .next $out/
            cp -r public $out/ 2>/dev/null || true
            cp package.json next.config.js $out/
            cp -r node_modules $out/
          '';

          meta = {
            description = "Personal development field journal — logs to ~/growth_mind/raw/";
            mainProgram = "next";
          };
        };
      });
}
