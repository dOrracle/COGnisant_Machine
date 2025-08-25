class OrganicEvolution {
  constructor({ mutationRate = 0.1, rng = Math.random } = {}) {
    this.mutationRate = mutationRate;
    this.currentCycle = 0;
    this.rng = rng;
  }

  async evolve(population, healthMap, usageHistory) {
    this.currentCycle++;
    const newCandidates = [];
    const top = population.slice().sort((a,b)=> (healthMap.get(b.id)?.fitness || 0) - (healthMap.get(a.id)?.fitness || 0)).slice(0, Math.ceil(population.length * 0.3));
    for(const p of top){
      if(this.rng() < this.mutationRate){
        const mutated = JSON.parse(JSON.stringify(p));
        mutated.id = `${p.id}_mut_${this.currentCycle}`;
        mutated.generation = (p.generation || 0) + 1;
        newCandidates.push(mutated);
      }
    }
    return newCandidates;
  }

  getCurrentCycle(){ return this.currentCycle; }
}
module.exports = OrganicEvolution;