let macas = []; // Maçãs ainda na árvore
let macasColetadas = []; // Maçãs dentro da caixa coletora
let caixaColetora;
let macieira;
let feira;
let macasNaBanca = [];
let pegouMacaParaFeira = false;
let macaParaFeira = null;
let predios = [];
let indiceProximaMacaCair = 0;
let tempoEntreQuedas = 30; // Ajuste para controlar a velocidade da queda sequencial
let contadorTempo = 0;
let iniciarQueda = false;

function setup() {
  createCanvas(800, 600);
  macieira = new Macieira(width / 4, height - 150);
  caixaColetora = new Caixa(width / 4, height - 70, 100, 50);
  feira = new Feira(width * 0.75, height - 250);

  // Inicializa 25 maçãs e as espalha pela copa da macieira
  for (let i = 0; i < 25; i++) {
    let xMaca, yMaca;
    let attempts = 0;
    do {
      xMaca = macieira.x + random(-macieira.copaRaio * 0.9, macieira.copaRaio * 0.9);
      yMaca = macieira.y - macieira.troncoH - macieira.copaRaio / 2 + random(-macieira.copaRaio * 0.8, macieira.copaRaio * 0.6);
      attempts++;
      if (attempts > 100) break;
    } while (dist(xMaca, yMaca, macieira.x, macieira.y - macieira.troncoH - macieira.copaRaio / 2) > macieira.copaRaio);

    macas.push(new Maca(xMaca, yMaca));
  }

  // Inicializa alguns prédios
  predios.push(new Predio(width * 0.65, height - 150, 80, 180));
  predios.push(new Predio(width * 0.78, height - 150, 70, 150));
  predios.push(new Predio(width * 0.50, height - 150, 90, 220));
  predios.push(new Predio(width * 0.90, height - 150, 60, 120));
  predios.push(new Predio(width * 0.40, height - 150, 75, 170));
  predios.push(new Predio(width * 0.30, height - 150, 65, 140));
  predios.push(new Predio(width * 0.05, height - 150, 95, 200));
}

function draw() {
  background(135, 206, 235);
  fill(255, 255, 0);
  ellipse(width - 50, 50, 50, 50);
  fill(255);
  ellipse(100, 80, 120, 40);
  ellipse(150, 60, 100, 30);
  ellipse(width / 2 + 50, 100, 150, 50);
  ellipse(width / 2 + 100, 80, 120, 40);
  fill(34, 139, 34);
  rect(0, height - 150, width, 150);

  for (let predio of predios) {
    predio.display();
  }

  macieira.display();
  feira.display();

  // Desenha as maçãs que ainda não começaram a cair
  if (!iniciarQueda) {
    for (let maca of macas) {
      maca.display();
    }
  } else {
    // Faz as maçãs caírem sequencialmente APÓS a tecla espaço ser pressionada
    contadorTempo++;
    if (indiceProximaMacaCair < macas.length && contadorTempo >= tempoEntreQuedas) {
      macas[indiceProximaMacaCair].cair();
      indiceProximaMacaCair++;
      contadorTempo = 0;
    }
  }

  for (let i = macas.length - 1; i >= 0; i--) {
    let maca = macas[i];
    if (maca.caindo) {
      maca.update();
      maca.display();
      if (caixaColetora.coletar(maca)) {
        maca.caindo = false;
        maca.offsetX = maca.x - caixaColetora.x;
        maca.offsetY = maca.y - caixaColetora.y;
        macasColetadas.push(macas.splice(i, 1)[0]);
      }
    }
  }

  caixaColetora.display();

  for (let maca of macasColetadas) {
    maca.x = caixaColetora.x + maca.offsetX;
    maca.y = caixaColetora.y + maca.offsetY;
    maca.display();
  }

  for (let maca of macasNaBanca) {
    maca.display();
  }

  if (pegouMacaParaFeira && macaParaFeira) {
    macaParaFeira.x = mouseX;
    macaParaFeira.y = mouseY;
    macaParaFeira.display();
  }
}

function keyPressed() {
  // Inicia a queda das maçãs quando a tecla espaço é pressionada
  if (key === ' ') {
    iniciarQueda = true;
    indiceProximaMacaCair = 0; // Reinicia o índice para a primeira maçã
    contadorTempo = 0; // Reinicia o contador de tempo
  }

  // Lógica para mover a caixa coletora com as setas
  if (keyCode === LEFT_ARROW) {
    caixaColetora.move(-10);
  } else if (keyCode === RIGHT_ARROW) {
    caixaColetora.move(10);
  }

  // Lógica para pegar uma maçã para levar para a feira ('a')
  if (key === 'a' || key === 'A') {
    if (!pegouMacaParaFeira) {
      let macaDisponivel = null;
      if (macasColetadas.length > 0) {
        macaDisponivel = macasColetadas.pop();
      } else if (macas.length > 0) {
        // Agora só pega maçãs que NÃO estão caindo
        for (let i = macas.length - 1; i >= 0; i--) {
          if (!macas[i].caindo) {
            macaDisponivel = macas.splice(i, 1)[0];
            break;
          }
        }
      }
      if (macaDisponivel) {
        macaParaFeira = macaDisponivel;
        pegouMacaParaFeira = true;
      }
    }
  }

  // Lógica para colocar a maçã na barraca da feira ('w')
  if (key === 'w' || key === 'W') {
    if (pegouMacaParaFeira && macaParaFeira) {
      // Verifica se a maçã está próxima ao balcão da feira
      if (dist(macaParaFeira.x, macaParaFeira.y, feira.x, feira.y + feira.balcaoH / 2) < 100) {
        // Define a posição da maçã na banca
        macaParaFeira.x = feira.x + random(-feira.balcaoW / 4, feira.balcaoW / 4);
        macaParaFeira.y = feira.y + feira.posteH + feira.balcaoH / 2 - feira.balcaoH / 4;
        // Adiciona a maçã à lista de maçãs na banca
        macasNaBanca.push(macaParaFeira);
        // Reseta as variáveis para pegar a próxima maçã
        pegouMacaParaFeira = false;
        macaParaFeira = null;
      }
    }
  }
}

// --- Classes do Jogo ---

class Macieira {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.troncoH = 150;
    this.troncoW = 30;
    this.copaRaio = 100;
  }

  display() {
    fill(139, 69, 19);
    rect(this.x - this.troncoW / 2, this.y - this.troncoH, this.troncoW, this.troncoH);
    fill(34, 139, 34);
    ellipse(this.x, this.y - this.troncoH - this.copaRaio / 2, this.copaRaio * 2, this.copaRaio * 2);
  }
}

class Maca {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.raio = 15;
    this.caindo = false;
    this.velocidadeY = 0;
    this.gravidade = 0.5;
    this.offsetX = 0;
    this.offsetY = 0;
  }

  display() {
    fill(255, 0, 0);
    ellipse(this.x, this.y, this.raio * 2, this.raio * 2);
    stroke(80, 40, 0);
    strokeWeight(2);
    line(this.x, this.y - this.raio, this.x + 5, this.y - this.raio - 10);
    noStroke();
  }

  cair() {
    this.caindo = true;
    this.velocidadeY = 0;
  }

  update() {
    if (this.caindo) {
      this.y += this.velocidadeY;
      this.velocidadeY += this.gravidade;
      if (this.y > height + this.raio) {
        this.caindo = false;
      }
    }
  }
}

class Caixa {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  display() {
    noFill();
    stroke(139, 69, 19);
    strokeWeight(3);
    rect(this.x - this.w / 2, this.y - this.h / 2, this.w, this.h);
    noStroke();
  }

  move(direcao) {
    this.x += direcao;
    this.x = constrain(this.x, this.w / 2, width - this.w / 2);
  }

  coletar(maca) {
    if (
      maca.y + maca.raio > this.y - this.h / 2 &&
      maca.x > this.x - this.w / 2 &&
      maca.x < this.x + this.w / 2 &&
      maca.y < this.y + this.h / 2 + maca.raio
    ) {
      return true;
    }
    return false;
  }
}

class Feira {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.tendaW = 200;
    this.tendaH = 100;
    this.balcaoW = 180;
    this.balcaoH = 60;
    this.posteH = 150;

    this.corTenda = color(255, 100, 100);
    this.corPoste = color(100, 50, 0);
    this.corBalcao = color(160, 82, 45);
    this.corLuz = color(255, 255, 0, 200);
  }

  display() {
    fill(this.corPoste);
    rect(this.x - this.tendaW / 2 + 10, this.y, 10, this.posteH);
    rect(this.x + this.tendaW / 2 - 20, this.y, 10, this.posteH);

    fill(this.corTenda);
    triangle(
      this.x - this.tendaW / 2 - 10,
      this.y,
      this.x + this.tendaW / 2 + 10,
      this.y,
      this.x,
      this.y - this.tendaH
    );
    beginShape();
    vertex(this.x - this.tendaW / 2 - 10, this.y);
    vertex(this.x - this.tendaW / 2 + 10, this.y + 20);
    vertex(this.x + 0, this.y + 10);
    vertex(this.x + this.tendaW / 2 - 10, this.y + 20);
    vertex(this.x + this.tendaW / 2 + 10, this.y);
    endShape(CLOSE);

    fill(this.corBalcao);
    rect(this.x - this.balcaoW / 2, this.y + this.posteH, this.balcaoW, this.balcaoH);
    rect(this.x - this.balcaoW / 2 + 10, this.y + this.posteH + this.balcaoH, 10, 30);
    rect(this.x + this.balcaoW / 2 - 20, this.y + this.posteH + this.balcaoH, 10, 30);

    fill(255);
    rect(this.x - 60, this.y - this.tendaH - 30, 120, 25);
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(14);
    text("Feira da Maçã", this.x, this.y - this.tendaH - 17);

    for (let i = -3; i <= 3; i++) {
      fill(this.corLuz);
      ellipse(this.x + i * 25, this.y - this.tendaH + 10, 8, 8);
    }
  }
}

class Predio {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.corPrincipal = color(random(100, 180), random(100, 180), random(100, 180));
    this.corJanela = color(200, 200, 50, 150);
  }

  display() {
    noStroke();
    fill(this.corPrincipal);
    rect(this.x, this.y - this.h, this.w, this.h);
    let numJanelasX = floor(this.w / 20);
    let numJanelasY = floor(this.h / 30);
    for (let i = 0; i < numJanelasX; i++) {
      for (let j = 0; j < numJanelasY; j++) {
        let janelaX = this.x + 5 + i * (this.w / numJanelasX);
        let janelaY = this.y - this.h + 5 + j * (this.h / numJanelasY);
        fill(this.corJanela);
        rect(janelaX, janelaY, 10, 15);
      }
    }
  }
}