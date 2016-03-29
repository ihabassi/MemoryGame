(function () {
    'use strict';

    var myCanvas = 'myCanvas';
    var myGame;
    var game = {
        indexArr: [], // will hold the game indexes
        cardsNumber: 8, // represent the card pairs number in a game ()
        cardsPos: { // will store the x's and the y's of the cards after drawing them
            xs: [],
            ys: []
        },
        init: function () {
            var i;
            // creates the index array (pairs of each card)
            for (i = 0; i < this.cardsNumber; i += 1) {
                this.indexArr[(i * 2)] = i;
                this.indexArr[(i * 2) + 1] = i;
            }
        },
        firstChosen: -1, // stores the first choice of a card
        secondChosen: -1, // stores the second choice of a card
        isClickable: true, // boolean to indicate if card is clickable or not
        steps: 0
    };

    // this function randomly change the order of the game index array
    var gameIndexShuffle = function (p_arr) {
        var i;
        var toSwap, temp;
        var len = p_arr.length;

        for (i = len - 1; i >= 0; i -= 1) {
            toSwap = Math.floor(Math.random() * i);
            temp = p_arr[i];
            p_arr[i] = p_arr[toSwap];
            p_arr[toSwap] = temp;
        }

        return p_arr;
    };

    // when mouse click on card check if the X cordinate is in range of the cards
    var isMouseXInRange = function (p_x) {
        var i;
        var len = myGame.cardsPos.xs.length;

        for (i = 0; i < len; i += 1) {
            if (p_x >= myGame.cardsPos.xs[i] && p_x <= myGame.cardsPos.xs[i] + 150) {
                return i;
            }
        }

        return false;
    };

    // when mouse click on card check if the Y cordinate is in range of the cards
    var isMouseYInRange = function (p_y) {
        var i;
        var len = myGame.cardsPos.ys.length;

        for (i = 0; i < len; i += 1) {
            if (p_y >= myGame.cardsPos.ys[i] && p_y <= myGame.cardsPos.ys[i] + 200) {
                return i;
            }
        }

        return false;
    };

    // given the image number calculate it's row and column position and it's x and y cordinates
    var imagePosCalc = function (p_counter) {
        var col = p_counter % 4;
        var row = Math.floor(p_counter / 4);

        return {
            col: col,
            row: row,
            x: col * 170, // the width of the image/card + 20 padding
            y: row * 210  // the height of the image/card + 10 padding
        };
    };

    // returns the image postion on the stage given the col and the row number
    var imagePositionGetByMouseClick = function (p_col, p_row) {
        return p_row * 4 + p_col;
    };

    // draws the image on the canvas
    var imageDraw = function (p_idx, p_isBack, p_isInit) {
        // array of card images. the last one is the back side of the card
        var cards = ['transformers-1.jpg', 'transformers-2.jpg', 'transformers-3.jpg', 'transformers-4.jpg', 'transformers-5.jpg', 'transformers-6.jpg', 'transformers-7.jpg', 'transformers-8.jpg', 'transformers-9.jpg', 'transformers-10.jpg', 'transformers-back.jpg'];
        var cardImage = new Image();
        var canvas = document.getElementById(myCanvas);
        var context = canvas.getContext('2d');

        // if we are not tring to draw the back side of the card choose the card image from the array above using the game index array as it's array position.
        if (p_isBack === undefined || p_isBack === false) {
            cardImage.src = 'images/Cards/' + cards[myGame.indexArr[p_idx]];
        } else {
            // else draw the back side of the card
            cardImage.src = 'images/Cards/' + cards[cards.length - 1];
        }

        cardImage.onload = function () {
            var pos = imagePosCalc(p_idx);

            // if it's the first time we are creating the stage save the positions that we are creating/calculate to the myGame object for further use.
            if (p_isInit !== undefined && p_isInit !== false) {
                myGame.cardsPos.xs[pos.col] = pos.x;
                myGame.cardsPos.ys[pos.row] = pos.y;
            }
            context.drawImage(cardImage, pos.x, pos.y, 150, 200);
        };
    };

    // after choosing 2 images make a reset of the chosen one
    var chosenImagesReset = function (p_isMatch) {
        var duration;
        // if the cards don't match wait before reseting the images
        if (p_isMatch !== true) {
            duration = 1500;
        }

        setTimeout(function () {
            // if no match hide the image and change the cards back to the back side else if match the chosen images will stay visible
            if (p_isMatch !== true) {
                imageDraw(myGame.firstChosen, true);
                imageDraw(myGame.secondChosen, true);
            }
            // free the click flag
            myGame.isClickable = true;
            myGame.firstChosen = -1;
            myGame.secondChosen = -1;
        }, duration);
    };

    // check if the cards match and reset
    var imagesMatch = function () {
        var firstID = myGame.firstChosen;
        var secondID = myGame.secondChosen;
        var isMatch = false;

        if (myGame.indexArr[firstID] === myGame.indexArr[secondID]) {
            isMatch = true;
        }

        chosenImagesReset(isMatch);
    };

    // choose the image when click
    var imageChoose = function (p_idx) {
        // first check if the index we clicked on is not chosen already to prevent counting dublicate clicks on the same card
        if (p_idx !== myGame.firstChosen && p_idx !== myGame.secondChosen) {
            if (myGame.firstChosen === -1) {
                // if it's the first click change the first chosen flag
                myGame.firstChosen = p_idx;
            } else {
            // if it's the second click change the second chosen flag
                myGame.secondChosen = p_idx;
            }

            // draw the chosen card image on the canvas
            imageDraw(p_idx);
            // add one step to the game steps counter
            myGame.steps += 1;
            // update the dom (the counter)
            $('#game-result').html('Game Steps: ' + myGame.steps);
        }

        // if both cards we chosen check if the match
        if (myGame.firstChosen !== -1 && myGame.secondChosen !== -1) {
            imagesMatch();
            // meanwhile disable card onclick until the match process is done
            myGame.isClickable = false;
        }
    };

    // build the stage for the first time
    var stageBuild = function (p_idxArr) {
        var i;
        var len = p_idxArr.length;
        var canvas = document.getElementById(myCanvas);

        for (i = 0; i < len; i += 1) {
            imageDraw(i, true, true);
        }

        // gets the mouse position to use it as indecator in the mousedown event
        var getMousePos = function (canvas, evt) {
            var rect = canvas.getBoundingClientRect();
            return {
                x: evt.clientX - rect.left,
                y: evt.clientY - rect.top
            };
        };

        // since we are using one canvas there is no option add click event on each card so what we are doing is the get the mouse click cordinates and match it to the card position and use is to detect with card was clicked
        canvas.addEventListener('mousedown', function (evt) {
            var mousePos = getMousePos(canvas, evt);
            // first check the X poisition if it's in the cards range
            var col = isMouseXInRange(mousePos.x);
            var row;
            var currentCard;

            if (col !== false && col !== undefined) {
                // is the X position match then we check the Y position
                row = isMouseYInRange(mousePos.y);
                // if the Y position also in the range of one of the cards fire the image choose function/
                if (row !== false && row !== undefined) {
                    currentCard = imagePositionGetByMouseClick(col, row);
                    // check if the click flag is true before choosing.
                    if (myGame.isClickable === true) {
                        imageChoose(currentCard);
                    }
                }
            }
        }, false);
    };

    // start a new game
    var gameStart = function () {
        // reset the game steps result
        $('#game-result').html('');
        // create a new game object
        myGame = Object.create(game);
        // init the game index array
        myGame.init();
        // shuffle the game array
        myGame.indexArr = gameIndexShuffle(myGame.indexArr);
        // build the stage
        stageBuild(myGame.indexArr);
    };

    // click event for restart the game
    document.getElementById('restart-btn').addEventListener('click', function () {
        gameStart();
    });

    // start a new game
    gameStart();
}());