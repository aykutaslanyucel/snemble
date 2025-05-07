
// Predefined gradients
export const GRADIENTS = [
  // Professional gradients
  "linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)", // Original - Soft Paper
  "linear-gradient(109.6deg, rgba(223,234,247,1) 11.2%, rgba(244,248,252,1) 91.1%)", // Original - Gentle Sky
  "linear-gradient(to top, #e6e9f0 0%, #eef1f5 100%)", // Clean Slate
  "linear-gradient(to top, #accbee 0%, #e7f0fd 100%)", // Serene Blue
  
  // Pastel gradients
  "linear-gradient(90deg, hsla(277, 75%, 84%, 1) 0%, hsla(297, 50%, 51%, 1) 100%)", // Original - Purple Dream
  "linear-gradient(90deg, hsla(46, 73%, 75%, 1) 0%, hsla(176, 73%, 88%, 1) 100%)", // Original - Sunlit Ocean
  "linear-gradient(90deg, hsla(59, 86%, 68%, 1) 0%, hsla(134, 36%, 53%, 1) 100%)", // Original - Fresh Lime
  "linear-gradient(90deg, hsla(59, 86%, 68%, 1) 0%, hsla(134, 36%, 53%, 1) 100%)", // Original - Lime Shine
  
  // Vibrant gradients
  "linear-gradient(90deg, hsla(39, 100%, 77%, 1) 0%, hsla(22, 90%, 57%, 1) 100%)", // Amber Glow
  "linear-gradient(90deg, hsla(24, 100%, 83%, 1) 0%, hsla(341, 91%, 68%, 1) 100%)", // Sunset Vibe
  
  // Subtle gradients
  "linear-gradient(90deg, hsla(186, 33%, 94%, 1) 0%, hsla(216, 41%, 79%, 1) 100%)", // Subtle Blue
  "linear-gradient(to top, #d299c2 0%, #fef9d7 100%)", // Soft Blossom
  
  // Deep gradients
  "linear-gradient(90deg, hsla(221, 45%, 73%, 1) 0%, hsla(220, 78%, 29%, 1) 100%)", // Deep Ocean
  "linear-gradient(to right, #243949 0%, #517fa4 100%)", // Twilight Sky
  
  // Warm gradients
  "linear-gradient(to right, #ee9ca7, #ffdde1)", // Soft Peach
  "linear-gradient(to right, #ffc3a0 0%, #ffafbd 100%)", // Sweet Coral
  
  // Earth tones
  "linear-gradient(to right, #c1c161 0%, #c1c161 0%, #d4d4b1 100%)", // Olive Garden
  "linear-gradient(to top, #e6b980 0%, #eacda3 100%)", // Desert Sand
  
  // Added: Radial gradients
  "radial-gradient(circle, #f9f9f9, #e4e4e4)", // Soft Radial Gray
  "radial-gradient(circle, #f5f7fa, #c3cfe2)", // Cool Breeze
  "radial-gradient(circle at top left, #ff9a9e, #fad0c4)", // Morning Blush
  "radial-gradient(circle at bottom right, #a1c4fd, #c2e9fb)", // Ocean View
  "radial-gradient(circle at center, #fad0c4 0%, #ffd1ff 100%)", // Sweet Candy
  "radial-gradient(ellipse at top, #accbee, #e7f0fd)", // Fresh Air
  "radial-gradient(circle at top right, #f6d365, #fda085)", // Golden Hour
  
  // Added: Multi-stop gradients
  "linear-gradient(60deg, #96deda 0%, #50c9c3 100%)", // Turquoise Sea
  "linear-gradient(to right, #fa709a 0%, #fee140 100%)", // Sweet Sunset
  "linear-gradient(to right, #43e97b 0%, #38f9d7 100%)", // Lush Meadow
  "linear-gradient(45deg, #874da2 0%, #c43a30 100%)", // Royal Crimson
  "linear-gradient(to right, #4facfe 0%, #00f2fe 100%)", // Blue Lagoon
  "linear-gradient(to right, #f78ca0 0%, #f9748f 19%, #fd868c 60%, #fe9a8b 100%)", // Cherry Blossom
  "linear-gradient(to top, #c471f5 0%, #fa71cd 100%)", // Neon Glow
];

// Predefined solid colors
export const COLORS = [
  // Status-based colors
  "#D3E4FD", // Blue - Available
  "#F2FCE2", // Green - Some Availability
  "#FEF7CD", // Yellow - Busy
  "#FFDEE2", // Red - Seriously Busy
  "#F1F0FB", // Purple - Away
  "#E5DEFF", // Lavender
  
  // Pastel colors
  "#FDE1D3", // Soft Peach
  "#FEC6A1", // Soft Orange
  "#D6BCFA", // Light Purple
  "#C8F7DC", // Mint Green
  "#FFE8CC", // Pale Orange
  
  // Professional colors
  "#E2E8F0", // Slate Gray
  "#F8FAFC", // Ultra Light Gray
  "#EFF6FF", // Faint Blue
  "#F1F5F9", // Platinum
  
  // Vibrant colors
  "#93C5FD", // Vibrant Blue
  "#C4B5FD", // Medium Purple
  "#FCA5A5", // Soft Red
  "#86EFAC", // Fresh Green
  "#FCD34D", // Bright Yellow
  
  // Neutral tones
  "#F9FAFB", // Off White
  "#F3F4F6", // Light Gray
  "#E5E7EB", // Pale Gray
  "#D1D5DB", // Medium Gray
  
  // Added: Warm tones
  "#E07A5F", // Terracotta
  "#F9BEC7", // Blush
  "#F6BD60", // Amber
  "#DDA15E", // Caramel
  "#BC6C25", // Bronze
  
  // Added: Cool tones
  "#84A9C0", // Teal Blue
  "#5C8D89", // Deep Teal
  "#78A1BB", // Azure
  "#6D8EAD", // Cornflower
  "#495867", // Slate Blue
  
  // Added: Nature-inspired
  "#606C38", // Forest Green
  "#283618", // Deep Forest
  "#557B83", // Ocean Blue
  "#DDA15E", // Sandy Beige
  "#EEEBD0", // Pale Sage
  
  // Added: Rich tones
  "#9C0D38", // Burgundy
  "#023047", // Navy Blue
  "#386641", // Emerald
  "#6A040F", // Ruby Red
  "#540B0E", // Mahogany
];

// Animation presets for gradients
export const ANIMATIONS = {
  none: "",
  gentle: "animate-gradient-gentle",
  smooth: "animate-gradient-smooth",
  energetic: "animate-gradient-energetic",
  dramatic: "animate-gradient-dramatic"
};

// Gradient angle presets
export const GRADIENT_ANGLES = [
  { value: "0", label: "Top to Bottom (0°)" },
  { value: "45", label: "Top-Left to Bottom-Right (45°)" },
  { value: "90", label: "Left to Right (90°)" },
  { value: "135", label: "Bottom-Left to Top-Right (135°)" },
  { value: "180", label: "Bottom to Top (180°)" },
  { value: "225", label: "Bottom-Right to Top-Left (225°)" },
  { value: "270", label: "Right to Left (270°)" },
  { value: "315", label: "Top-Right to Bottom-Left (315°)" },
];

// Radial gradient position presets
export const RADIAL_POSITIONS = [
  { value: "center", label: "Center" },
  { value: "top", label: "Top" },
  { value: "top right", label: "Top Right" },
  { value: "right", label: "Right" },
  { value: "bottom right", label: "Bottom Right" },
  { value: "bottom", label: "Bottom" },
  { value: "bottom left", label: "Bottom Left" },
  { value: "left", label: "Left" },
  { value: "top left", label: "Top Left" },
];
