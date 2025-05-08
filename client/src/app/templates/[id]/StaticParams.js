// This file handles static generation parameters for the template routes
export async function generateStaticParams() {
  // For static export, we return some essential template IDs
  // These will be pre-rendered at build time
  try {
    // In a real implementation, you might fetch your most popular templates
    // But for static export, an empty array means these will be generated at runtime
    return [];
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}