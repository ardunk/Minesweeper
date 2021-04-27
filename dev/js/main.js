$(function() {
  let field;
  let rows;
  let columns;
  let mines;
  let tilesOpen;
  let flagsSet;
  let initial = true;
  let timer;
  let time;
  let tileSize = 35;
  let tileLimit;

  let difficulty = localStorage.getItem(`difficulty`) ?
                    localStorage.getItem(`difficulty`) :
                    `beginner`;

  setDifficulty(difficulty);
  displayRecord();
  displayField();

  function displayField() {
    $(`#play-area`).css(`width`, `${tileSize * columns}px`);
    for (let row = 0; row <= rows - 1; row++) {
      for (let col = 0; col <= columns - 1; col++) {
        let $tile = $(`<div>`, {class:`tile`, 'data-row':row, 'data-col':col});
        $(`#play-area`).append($tile);
      }
    }

    $(`#mines`).text(`${mines}`);
    $(`#minutes, #seconds`).text(`00`);
  }

  function newGame(startRow, startCol) {
    let row;
    let col;
    let minesSet = 0;
    let count;

    field = Array(rows).fill().map(() => Array(columns).fill(0));

    while (minesSet < mines) {
      row = Math.floor(Math.random() * rows);
      col = Math.floor(Math.random() * columns);
      if ((row !== startRow || col !== startCol) && field[row][col] !== 9) {
        field[row][col] = 9;
        minesSet++;
      }
    }

    for (row = 0; row <= rows - 1; row++) {
      for (col = 0; col <= columns - 1; col++) {
        if (field[row][col] !== 9) {
          count = 0;
          if (row !== 0) {
            if (field[row - 1][col - 1] === 9) count++;
            if (field[row - 1][col + 1] === 9) count++;
            if (field[row - 1][col] === 9) count++;
          }
          if (row !== rows - 1) {
            if (field[row + 1][col - 1] === 9) count++;
            if (field[row + 1][col + 1] === 9) count++;
            if (field[row + 1][col] === 9) count++;
          }
          if (field[row][col - 1] === 9) count++;
          if (field[row][col + 1] === 9) count++;

          field[row][col] = count;
        }
      }
    }

    time = 0;
    tilesOpen = 0;
    flagsSet = 0;

    timer = setInterval(function () {
      $(`#seconds`).text(pad(++time%60));
      $(`#minutes`).text(pad(parseInt(time/60,10)));
    }, 1000);

    $(`#restart`).removeClass(`disabled`);
  }

  function pad (value) {
    return value > 9 ? value : `0` + value;
  }

  function resetGame() {
    clearInterval(timer);
    initial = true;

    $(`#message, #new-record`).hide();
    $(`#restart`).addClass(`disabled`);
    $(`#play-area`).empty();
    displayField();
  }

  function openTile(row, col) {
    if(field[row][col] < 10) {
      $(`[data-row=${row}][data-col=${col}]`).addClass(`open disabled`);

      if (field[row][col] > 0) {
        if (field[row][col] === 1) {
          $(`[data-row=${row}][data-col=${col}]`).css(`color`, `darkblue`);
        } else if (field[row][col] === 2) {
          $(`[data-row=${row}][data-col=${col}]`).css(`color`, `green`);
        } else if (field[row][col] === 3) {
          $(`[data-row=${row}][data-col=${col}]`).css(`color`, `red`);
        } else {
          $(`[data-row=${row}][data-col=${col}]`).css(`color`, `darkviolet`);
        }
        $(`[data-row=${row}][data-col=${col}]`).text(`${field[row][col]}`);
      }

      field[row][col] += 10;
      tilesOpen++;

      if (tilesOpen === rows * columns - mines) {
        $(`#message`).css(`color`, `green`);
        $(`#message`).text(`You Won!`).show();

        gameOver();
        setRecord();
      }

      if (field[row][col] === 10) {
        if(row !== 0) {
          openTile(row - 1, col - 1);
          openTile(row - 1, col + 1);
          openTile(row - 1, col);
        }
        if(row !== rows - 1) {
          openTile(row + 1, col - 1);
          openTile(row + 1, col + 1);
          openTile(row + 1, col);
        }
        openTile(row, col - 1);
        openTile(row, col + 1);
      }
    }
  }

  function setFlag(row, col) {
    if (field[row][col] <= 9) {
      flagsSet++;
      field[row][col] += 20;

      $(`#mines`).text(`${mines - flagsSet}`);
      $(`[data-row=${row}][data-col=${col}]`).text('`');
    } else if (field[row][col] >= 20) {
      flagsSet--;
      field[row][col] -= 20;

      $(`#mines`).text(`${mines - flagsSet}`);
      $(`[data-row=${row}][data-col=${col}]`).text(``);
    }
  }

  function gameOver(row, col) {
    clearInterval(timer);

    $(`.tile`).addClass(`disabled`);
    $(`#mines`).text(`0`);

    for (let row = 0; row <= rows - 1; row++) {
      for (let col = 0; col <= columns - 1; col++) {
        if ((field[row][col] % 10) === 9) {
          $(`[data-row=${row}][data-col=${col}]`).addClass(`open`).text(`*`);
        }
      }
    }
  }

  function setRecord() {
    if (!localStorage.getItem(`${difficulty}-record`) ||
        localStorage.getItem(`${difficulty}-record`) > time) {
          localStorage.setItem(`${difficulty}-record`, time);

          $(`#new-record`).show();
    }

    displayRecord();
  }

  function displayRecord() {
    $(`.records-list-item span`).each(function() {
      if (localStorage.getItem(`${this.id}`)) {
        $(`#${this.id}`).text
          (pad(parseInt(localStorage.getItem(`${this.id}`)/60,10)) + `:` +
            pad(localStorage.getItem(`${this.id}`)%60));
      }
    });
  }

  function setDifficulty(newDifficulty) {
    difficulty = newDifficulty;
    localStorage.setItem(`difficulty`, `${difficulty}`);
    tileLimit = Math.floor($(`body`).width() / tileSize);

    switch (difficulty) {
      case `beginner`:
        columns = tileLimit < 9 ? tileLimit : 9;
        rows = Math.floor(9 * 9 / columns);
        mines = 10;
        break;
      case `intermediate`:
        columns = tileLimit < 16 ? tileLimit : 16;
        rows = Math.floor(16 * 16 / columns);
        mines = 40;
        break;
      case `expert`:
        columns = tileLimit < 30 ? tileLimit : 30;
        rows = Math.floor(30 * 16 / columns);
        mines = 99;
        break;
    }

    $(`.difficulty-list-item`).removeClass(`disabled`);
    $(`#${difficulty}`).addClass(`disabled`);
  }

  $(`#wrapper`).on(`click`, `#message`, function() {
    $(`#message`).hide();
  });

  $(`#play-area`).on(`click`, `.tile`, function() {
    let row = $(this).data(`row`);
    let col = $(this).data(`col`);

    if (initial) {
      initial = false;
      newGame(row, col);
    }

    if(field[row][col] === 9) {
      $(this).css(`background-color`, `red`);
      $(`#message`).css(`color`, `red`);
      $(`#message`).text(`You Lost`).show();

      gameOver(row, col);
    } else {
      openTile(row, col);
    }
  });

  $(`#play-area`).contextmenu(function(event) {
    event.preventDefault();
  });

  $(`#play-area`).on(`contextmenu`, `.tile`, function() {
    if(!initial) {
      let row = $(this).data(`row`);
      let col = $(this).data(`col`);

      setFlag(row, col);
    }
  });

  $(`#restart`).click(function() {
    resetGame();
  });

  $(`#beginner, #intermediate, #expert`).click(function() {
    setDifficulty(this.id);
    resetGame();

    $(`#play-area`)[0].scrollIntoView({behavior: `smooth`});
  });

  $(window).resize(function() {
    location.reload();
  });
});
