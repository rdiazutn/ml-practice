class Adn{
  genes = []
  constructor () {
    for (let i = 0; i < lifetime; i++) {
      this.genes.push(this.generateGene())
    }
  }

  crossover (partner) {
    const child = new Adn()
    for (let i = 0; i < this.genes.length; i++) {
      const random = Math.random()
      child.genes[i] = random <= 0.5 ? this.genes[i] : partner.genes[i]
    }
    return child
  }

  mutate () {
    this.genes = this.genes.map(gene => {
      const random = Math.random()
      return random <= mutationRate ? this.generateGene() : gene
    })
  }

  toString () {
    return this.genes.join('')
  }

  generateGene () {
    return createVector(random(-10,10), random(-10,10)).mult(random(0, maxForce))
  }
}

class GeneticRocket extends Rocket {
  adn = null
  geneCounter = 0
  constructor(dna) {
    super(startingPoint.x, startingPoint.y)
    this.adn = dna || new Adn()
  }

  live () {
    if (this.fitness < 1) {
      this.applyForce(this.adn.genes[this.geneCounter])
      this.geneCounter++
      this.update()
    }
  }

  setFitness () {
    const distanceFromOrigin = startingPoint.dist(destination)
    const distance = this.position.dist(destination) - destinationRadius
    const distanceFitness = Math.max(1 - distance / distanceFromOrigin, 0)
    const lifeFitness = this.geneCounter / lifetime
    console.log(lifeFitness)
    this.fitness = distanceFitness * lifeFitness
  }
}

class GeneticAlgorithm {
  constructor () {
    this.setup()
  }

  setup () {
    this.populationSize = 60
    this.maxGenerations = 1000
    this.generation = 0
    this.lifecounter = 0
    this.best = null
    this.population = []
    for (let i = 0; i < this.populationSize ; i++) {
      const adn = new GeneticRocket()
      this.population.push(adn)
    }
  }

  run () {
    if (this.fitness() === 1) {
      return
    }
    if (this.lifecounter < lifetime) {
      this.live()
      this.lifecounter ++
    } else {
      this.lifecounter = 0
      this.nextGeneration()
    }
  }

  live () {
    this.population.forEach(adn => adn.live())
  }

  nextGeneration () {
    // Fitness
    this.population.forEach(adn => adn.setFitness())
    this.population.sort((a, b) => b.fitness - a.fitness)
    // Generate stats
    this.best = this.population[0]
    this.generation++
    this.generateStats()
    // Selection
    this.matingPool = this.selection()
    // Crossover and mutation
    this.reproduction()
  }



  selection () {
    const matingPool = []
    this.population.forEach(adn => {
      for (let i = 0; i < (adn.fitness * adn.fitness * 10000); i++) {
        matingPool.push(adn)
      }
    })
    return matingPool
  }

  reproduction () {
    const newDnaPopulation = []
    // Reproduction
    for (let i = 0; i < this.populationSize ; i++) {
      const parentA = this.matingPool[Math.floor(Math.random() * this.matingPool.length)]
      const parentB = this.getDifferentParent(parentA)
      const child = parentA.adn.crossover(parentB.adn)
      newDnaPopulation.push(child)
    }
    // Mutation
    this.population = newDnaPopulation.map(childADN => {
      childADN.mutate()
      return new GeneticRocket(childADN)
    })
  }

  getDifferentParent (parent) {
    let posibleParent = null
    do {
      posibleParent = this.matingPool[Math.floor(Math.random() * this.matingPool.length)]
    } while (posibleParent === parent)
    return posibleParent
  }

  fitness () {
    return this.best?.fitness
  }

  generateStats () {
    console.log('----------------------------------------')	
    console.log('Generation: ' + this.generation)
    console.log('Fitness: ' + this.fitness())
    console.log('Average fitness: ' + this.population.reduce((prev, curr) => prev + curr.fitness, 0) / this.population.length)
    console.log('----------------------------------------')
  }
}