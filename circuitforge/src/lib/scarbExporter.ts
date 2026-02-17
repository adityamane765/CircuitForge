import JSZip from 'jszip';

export async function exportScarbProject(cairoCode: string, circuitName: string): Promise<Blob> {
  const zip = new JSZip();

  // Sanitize circuit name for directory/file names
  const safeName = circuitName.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase() || 'circuit';

  const scarbToml = `[package]
name = "${safeName}"
version = "0.1.0"
edition = "2024_07"

[dependencies]
starknet = ">=2.9.1"

[[target.starknet-contract]]
`;

  zip.file(`${safeName}/Scarb.toml`, scarbToml);
  zip.file(`${safeName}/src/lib.cairo`, cairoCode);

  return zip.generateAsync({ type: 'blob' });
}
