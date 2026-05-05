{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    nodejs_20
    nodePackages.npm
  ];

  shellHook = ''
    echo "🚀 SvelteKit Dev Environment (legacy shell)"
    echo "Node: $(node --version)"
  '';
}
