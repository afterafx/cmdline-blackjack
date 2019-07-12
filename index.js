const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

class Player {
  constructor() {
    this.hand = [];
  }
}

class Card {
  constructor(suit, value) {
    this.suit = suit;
    this.value = value;
  }
}

class Deck {
  constructor() {
    this.suits = ['♥️', '♦️', '♣️', '♠️'];
    this.values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    this.cards = [];
  }

  createDeck() {
    this.suits.forEach(suit => {
      this.values.forEach(value => {
        this.cards.push(new Card(suit, value));
      });
    });
    this.shuffle();
  }

  shuffle() {
    for (let i = 0; i < 10000; i++) {
      const randomIndex = Math.floor(Math.random() * 52);
      const randomCard = this.cards.splice(randomIndex, 1)[0];
      this.cards.push(randomCard);
    }
  }
}

class Game {
  constructor() {
    this.deck = '';
    this.player = new Player();
    this.dealer = new Player();
  }

  getFreshDeck() {
    const deck = new Deck();
    deck.createDeck();
    deck.shuffle();
    this.deck = deck;
  }

  start() {
    console.log('\n=========================================');
    console.log(' WELCOME TO BLACKJACK');
    console.log('========================================= \n \n');

    this.getFreshDeck();

    // Deal to players
    this.dealCard(this.player);
    this.dealCard(this.dealer);
    this.dealCard(this.player);
    this.dealCard(this.dealer);

    this.runTurn();
  }

  runTurn() {
    this.printHands();
    this.isWin()
      .then(win => {
        console.log(win);
      })
      .catch(() => {
        this.askToHit()
          .then(res => {
            this.dealCard(this.player);
            this.runTurn();
          })
          .catch(() => this.runDealerTurn());
      });
  }

  runDealerTurn() {
    console.log('running dealer turn');
    return 'Dealer logic goes here';
  }

  askToHit() {
    return new Promise(function(resolve, reject) {
      rl.question('Hit or stay? press (h / s) ', answer => {
        if (answer === 'h') {
          resolve(true);
        } else {
          reject();
        }
      });
    });
  }

  dealCard(dealTo) {
    dealTo.hand.push(this.deck.cards.pop());
  }

  printHands() {
    const playerHand = [];
    const dealerHand = [];

    this.player.hand.forEach(card => playerHand.push(card.value + card.suit));
    this.dealer.hand.forEach(card => dealerHand.push(card.value + card.suit));

    console.log(`Dealer's hand: ${dealerHand} \n \n`);
    console.log(`Player's hand: ${playerHand} \n \n`);
  }

  isWin() {
    const lookup = {
      A: 11,
      K: 10,
      Q: 10,
      J: 10,
      '10': 10,
      '9': 9,
      '8': 8,
      '7': 7,
      '6': 6,
      '5': 5,
      '4': 4,
      '3': 3,
      '2': 2,
    };

    return new Promise((resolve, reject) => {
      let playerSum = 0;
      let dealerSum = 0;

      // check if player hand is greater than or equal to dealer hand
      this.player.hand.forEach(card => {
        playerSum += lookup[card.value];
      });

      this.dealer.hand.forEach(card => {
        dealerSum += lookup[card.value];
      });

      if (playerSum > 21) {
        resolve('Player busts!');
      } else if (dealerSum > 21) {
        resolve('Dealer busts!');
      } else if (playerSum === 21 && dealerSum === 21) {
        resolve("Double Jackpot! It's a draw...");
      } else if (playerSum === 21 && dealerSum !== 21) {
        resolve('Blackjack! Player Wins!');
      } else if (dealerSum === 21 && playerSum !== 21) {
        resolve('BLACKJACK! Dealer Wins!');
      } else {
        reject();
      }
    });
  }
}

const game = new Game();
game.start();
