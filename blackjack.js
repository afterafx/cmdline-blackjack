const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function createDeck() {
  const deck = [];
  const suits = ['♥️', '♦️', '♣️', '♠️'];
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  suits.forEach(suit => {
    values.forEach(value => {
      let weight = parseInt(value);
      if (value === 'K' || value === 'Q' || value === 'J') {
        weight = 10;
      } else if (value === 'A') {
        weight = 11;
      }
      deck.push({ suit, value, weight });
    });
  });
  return deck;
}

function shuffle(deck) {
  for (let i = 0; i < 100000; i++) {
    const randomIndex = Math.floor(Math.random() * 51);
    const randomCard = deck.splice(randomIndex, 1)[0];
    deck.push(randomCard);
  }
  return deck;
}

function dealInitialCards(deck) {
  const playerHand = [];
  const newDeck = [...deck];
  for (let i = 0; i < 2; i++) {
    playerHand.push(newDeck.pop());
  }
  return {
    playerHand,
    newDeck,
  };
}

function printHands(player, dealer, playerTurn) {
  const playerHand = [...player];
  const dealerHand = [...dealer];
  const playerString = [];
  const dealerString = [];

  playerHand.forEach(card => {
    playerString.push(card.value + card.suit);
  });

  dealerHand.forEach(card => {
    dealerString.push(card.value + card.suit);
  });
  if (playerTurn) {
    console.log('=================== Player Hand ===================');
    console.log(`${playerString.join(', ')}\n`);
    console.log('=================== Dealer Hand ===================');
    console.log(`X, ${dealerString[1]}\n`);
  } else {
    console.log('=================== Player Hand ===================');
    console.log(`${playerString.join(', ')}\n`);
    console.log('=================== Dealer Hand ===================');
    console.log(`${dealerString.join(', ')}\n`);
  }
}

function checkWin(player, dealer) {
  const playerSum = checkSum(player);
  const dealerSum = checkSum(dealer);

  return new Promise((resolve, reject) => {
    if (playerSum > 21) {
      resolve('Player busts!, Dealer Wins!');
    } else if (dealerSum > 21) {
      resolve('Dealer busts!, Player Wins!');
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

function checkFinalWin(player, dealer) {
  const dealerSum = checkSum(dealer);
  const playerSum = checkSum(player);

  if (playerSum > dealerSum) {
    console.log('Player Wins');
  } else if (dealerSum > playerSum) {
    console.log('Dealer Wins');
  } else if (playerSum === dealerSum) {
    console.log('Its a draw!');
  }
}

function checkSum(player) {
  let playerSum = 0;

  // use reduce
  player.forEach(card => {
    playerSum += card.weight;
  });

  if (playerSum > 21) {
    playerSum = 0;
    player.forEach(card => {
      if (card.weight === 11) {
        playerSum += 1;
      } else {
        playerSum += card.weight;
      }
    });
  }

  return playerSum;
}

function dealCard(player, deck) {
  const newDeck = [...deck];
  const playerHand = [...player];
  playerHand.push(newDeck.pop());
  return {
    playerHand,
    newDeck,
  };
}

function askToHit() {
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

function runTurn(player, dealer, deck) {
  // Print players hands
  printHands(player, dealer, true);

  // checkWinner
  checkWin(player, dealer)
    .then(win => {
      printHands(player, dealer);
      console.log(win);
      rl.close();
    })
    .catch(() => {
      askToHit()
        .then(res => {
          const result = dealCard(player, deck);
          runTurn(result.playerHand, dealer, result.newDeck);
        })
        .catch(() => {
          rl.close();
          runDealerTurn(player, dealer, deck);
        });
    });
}

function runDealerTurn(player, dealer, deck) {
  let dealerSum = 0;

  dealer.forEach(card => {
    dealerSum += card.weight;
  });

  printHands(player, dealer);

  checkWin(player, dealer)
    .then(win => {
      console.log(win);
    })
    .catch(() => {
      if (dealerSum <= 16) {
        const result = dealCard(dealer, deck);
        runDealerTurn(player, result.playerHand, result.newDeck);
      } else {
        checkFinalWin(player, dealer);
      }
    });
}

function start() {
  console.log('\n=========================================');
  console.log(' WELCOME TO BLACKJACK');
  console.log('========================================= \n \n');

  let deck = createDeck();

  // Creates and shuffles the deck
  deck = shuffle(deck);

  // Deal inital cards to players
  let result = dealInitialCards(deck);
  const player = result.playerHand;
  deck = result.newDeck;
  result = dealInitialCards(deck);
  const dealer = result.playerHand;
  deck = result.newDeck;

  runTurn(player, dealer, deck);
}

start();
