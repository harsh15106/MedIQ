export const checkInteractions = async (req, res) => {
  const { drugs } = req.body;

  if (!drugs || drugs.length < 2) {
    return res.json({
      interactions_found: 0,
      interactions: []
    });
  }

  try {
    // Generate all drug pairs
    let pairs = [];

    for (let i = 0; i < drugs.length; i++) {
      for (let j = i + 1; j < drugs.length; j++) {
        pairs.push({
          drug_a: drugs[i],
          drug_b: drugs[j]
        });
        pairs.push({
          drug_a: drugs[j],
          drug_b: drugs[i] // handle reverse
        });
      }
    }

    // Fetch only matching interactions
    const { data, error } = await supabase
      .from('interactions')
      .select('*')
      .or(
        pairs
          .map(p => `and(drug_a.eq.${p.drug_a},drug_b.eq.${p.drug_b})`)
          .join(',')
      );

    if (error) throw error;

    res.json({
      interactions_found: data.length,
      interactions: data
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch interactions" });
  }
};