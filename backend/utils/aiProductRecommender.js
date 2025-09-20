// Mock AI-based product recommender
async function suggestProductsAI(user, products) {
  if (!user || !products) return [];

  // Filter products by user's risk appetite
  const filtered = products.filter(
    (p) => p.risk_level === user.risk_appetite
  );

  // Sort by annual yield (descending) and take top 5
  const top5 = filtered
    .sort((a, b) => b.annual_yield - a.annual_yield)
    .slice(0, 5);

  // Return only product names for filtering
  return top5.map((p) => p.name);
}

module.exports = { suggestProductsAI };
