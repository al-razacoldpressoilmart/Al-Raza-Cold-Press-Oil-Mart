export interface ProcessStep {
  stepNumber: string;
  title: string;
  subtitle: string;
  description: string;
  keyMetric: string;
  iconName: string;
}

export const PROCESS_STEPS: ProcessStep[] = [
  {
    stepNumber: "01",
    title: "Triple-Graded Organic Seed Selection",
    subtitle: "Non-GMO, Hand-Picked Single-Origin Seeds",
    description: "We source certified organic, hand-cleaned seeds (Groundnut, Sesame, Mustard, Kalonji, Almond). All seeds are sun-dried naturally and triple-sieved to remove dust and moisture before pressing.",
    keyMetric: "100% Sun-Dried • Zero Chemical Fumigation",
    iconName: "Sprout",
  },
  {
    stepNumber: "02",
    title: "Food-Grade 304 Stainless Steel Cold Press Extraction",
    subtitle: "Automatic Screw Press at Strict Low Temperature",
    description: "Seeds pass through our advanced commercial cold press screw expeller made of 100% food-grade 304 stainless steel. The slow precision auger operates below 42°C, preserving delicate volatile aromas, enzymes, and natural vitamins.",
    keyMetric: "Strict Temperature < 42°C • Zero Thermal Breakdown",
    iconName: "Cpu",
  },
  {
    stepNumber: "03",
    title: "Natural Cold Mechanical Extraction",
    subtitle: "Zero Chemical Solvents & Zero Friction Overheating",
    description: "Unlike high-speed commercial expellers that burn seeds at 200°C+, our machine uses continuous cold extrusion to naturally squeeze pure virgin oil drop by drop without heating.",
    keyMetric: "100% Mechanical • Zero Hexane / Solvents",
    iconName: "Flame",
  },
  {
    stepNumber: "04",
    title: "Natural Gravity Sedimentation (48 Hours)",
    subtitle: "No Pressure Filters or Chemical Bleaching",
    description: "The freshly extracted virgin oil is transferred to food-grade stainless steel settling vessels for 48 hours. Heavier natural seed particles settle gently to the bottom through natural gravity.",
    keyMetric: "Natural Settling • Zero Chemical Solvents",
    iconName: "Clock",
  },
  {
    stepNumber: "05",
    title: "Multi-Stage Cotton Mesh Filtration",
    subtitle: "Preserving Essential Live Micronutrients",
    description: "The oil is passed through natural unbleached cotton mesh filters. This catches microscopic particles while keeping live enzymes, vitamin E, omega fatty acids, and natural polyphenols intact.",
    keyMetric: "Unrefined • Live Micronutrients Preserved",
    iconName: "ShieldCheck",
  },
  {
    stepNumber: "06",
    title: "Hygienic Sealed Bottling & Quality Inspection",
    subtitle: "Sealed, Fresh & Ready for Daily Pure Use",
    description: "Every batch is verified for 0.00% mineral oil and zero chemical additives. The virgin oil is bottled in premium hygienic containers with tamper-evident seals to protect pure freshness.",
    keyMetric: "100% Food-Grade Safe • Fresh Sealed Guarantee",
    iconName: "PackageCheck",
  },
];

export const COMPARISON_DATA = [
  {
    feature: "Extraction Method",
    coldPress: "Food-Grade 304 Stainless Steel Cold Press Expeller (< 42°C)",
    refinedOil: "High-speed industrial expellers with extreme thermal friction (200°C+)",
  },
  {
    feature: "Chemical Solvents",
    coldPress: "Zero Chemicals, Hexane-free, 100% Pure Mechanical",
    refinedOil: "Petroleum-derived Hexane solvent used to dissolve seed oil",
  },
  {
    feature: "Bleaching & Deodorizing",
    coldPress: "Never bleached or deodorized; 100% natural aroma & golden color",
    refinedOil: "Treated with caustic soda, phosphoric acid & bleaching clays",
  },
  {
    feature: "Antioxidants & Vitamins",
    coldPress: "Natural Vitamin E, Resveratrol, Sesamol & Phytosterols retained intact",
    refinedOil: "Destroyed by extreme heat; synthetic chemical preservatives (TBHQ) added",
  },
  {
    feature: "Trans Fats & Free Radicals",
    coldPress: "0% Trans Fats, zero carcinogenic acrylamides",
    refinedOil: "Thermal processing generates harmful trans fatty acids & oxidation radicals",
  },
  {
    feature: "Packaging",
    coldPress: "Hygienic Food-Safe Sealed Bottles & Canisters",
    refinedOil: "Low-grade thin plastic pouches that leach phthalates",
  },
];
