'use strict';

(function () {

  const BIT_SETS_ELEM = document.getElementById('bit-sets');
  const BIT_SET_PROTO = document.getElementById('bit-set-div-proto');

  let bitSets = [];

  class BitSet {
    constructor(name, size, elem) {
      this.name = name;
      this.bits = [];
      this.otherBits = [];
      this.resultBits = [];

      for (let i = 0; i < size; i += 1) {
        this.bits.push(0);
        this.otherBits.push(0);
        this.resultBits.push(0);
      }

      this.link = name * 10;
      this.otherLink = name * 10;

      this.elem = elem;

      this.buttons = this.elem.getElementsByClassName('bit-btn');
      this.otherButtons = this.elem.getElementsByClassName('other-bit-btn');
      this.resultButtons = this.elem.getElementsByClassName('result-bit-btn');

      this.linkButton = this.elem.getElementsByClassName('link-button')[0];
      this.otherLinkButton = this.elem.getElementsByClassName('other-link-button')[0];

      this.op = null;
    }

    init() {
      let self = this;

      for (let i = 0; i < this.bits.length; i += 1) {
        this.buttons[i].addEventListener('click', function () { self.flipBit(i); });
        this.otherButtons[i].addEventListener('click', function () { self.flipOtherBit(i); });
      }

      let ops = this.elem.getElementsByClassName('bit-ops');
      for (let i = 0; i < ops.length; i += 1) {
        ops[i].name = 'bit-ops-' + this.name;
        if (ops[i].classList.contains('invert-bit-op')) {
          ops[i].addEventListener('change', function () {
            if (ops[i].value) {
              self.setOp(self.invert);
            }
          });
        } else if (ops[i].classList.contains('shiftright-bit-op')) {
          ops[i].addEventListener('change', function () {
            if (ops[i].value) {
              self.setOp(self.shiftRight);
            }
          });
        } else if (ops[i].classList.contains('shiftleft-bit-op')) {
          ops[i].addEventListener('change', function () {
            if (ops[i].value) {
              self.setOp(self.shiftLeft);
            }
          });
        } else if (ops[i].classList.contains('xor-bit-op')) {
          ops[i].addEventListener('change', function () {
            if (ops[i].value) {
              self.setOp(self.xor);
            }
          });
        }
      }

      if (this.name > 0) {
        this.linkButton.addEventListener('click', function () { self.cycleLinks(0); });
        this.otherLinkButton.addEventListener('click', function () { self.cycleLinks(1); });
      } else {
        this.linkButton.disabled = true;
        this.otherLinkButton.disabled = true;
      }

      this.refresh();
    }

    refresh() {
      this.elem.getElementsByClassName('bit-set-name-span')[0].innerText = this.name;

      for (let i = 0; i < this.buttons.length; i += 1) {
        this.buttons[i].innerText = this.bits[i];
        this.otherButtons[i].innerText = this.otherBits[i];
        this.buttons[i].disabled = this.link !== this.name * 10;
        this.otherButtons[i].disabled = this.otherLink !== this.name * 10;
      }

      this.linkButton.innerText = this.link === this.name * 10 ? 'INPUT' : linkName(this.link);
      this.otherLinkButton.innerText = this.otherLink === this.name * 10
          ? 'INPUT' : linkName(this.otherLink);

      this.elem.getElementsByClassName('other-bits-div')[0].hidden = !(this.op === this.xor);
    }

    setBit(index, value) {
      this.bits[index] = value;
      this.buttons[index].innerText = value;
      this.updateResultBits(index);
    }

    setOtherBit(index, value) {
      this.otherBits[index] = value;
      this.otherButtons[index].innerText = value;
      this.updateResultBits(index);
    }

    setResultBit(index, value) {
      this.resultBits[index] = value;
      this.resultButtons[index].innerText = value;
    }

    setOp(func) {
      this.op = func;
      this.refresh();
      this.updateResultBits(-1);
    }

    updateBits() {
      let bs = getSet(this.link);
      for (let i = 0; i < this.bits.length; i += 1) {
        this.setBit(i, bs[i]);
      }
    }

    updateOtherBits() {
      let bs = getSet(this.otherLink);
      for (let i = 0; i < this.otherBits.length; i += 1) {
        this.setOtherBit(i, bs[i]);
      }
    }

    updateResultBits(index) {
      if (!!this.op) {
        if (index >= 0) {
          this.op(index);
        } else {
          for (let i = 0; i < this.resultBits.length; i += 1) {
            this.op(i);
          }
        }
      }
    }

    flipBit(index) {
      this.setBit(index, 1 - this.bits[index]);
    }

    flipOtherBit(index) {
      this.setOtherBit(index, 1 - this.otherBits[index]);
    }

    invert(index) {
      this.setResultBit(index, 1 - this.bits[index]);
    }

    shiftRight(index) {
      if (index === this.bits.length - 1) {
        this.setResultBit(0, 0)
      } else {
        this.setResultBit(index + 1, this.bits[index]);
      }
    }

    shiftLeft(index) {
      if (index === 0) {
        this.setResultBit(this.bits.length - 1, 0)
      } else {
        this.setResultBit(index - 1, this.bits[index]);
      }
    }

    xor(index) {
      this.setResultBit(index, this.bits[index] ^ this.otherBits[index]);
    }

    cycleLinks(set) {
      function calcNext(i, name) {
        i = i + (i % 10 === 2 ? 8 : 1);
        i = i % (name * 10 + 1);
        return i;
      }

      switch (set) {
        case 0:
          this.link = calcNext(this.link, this.name);
          this.updateBits(-1);
          break;
        case 1:
          this.otherLink = calcNext(this.otherLink, this.name);
          this.updateOtherBits(-1);
          break;
        case 2:
          break;
      }

      this.refresh();
    }
  }

  function linkName(num) {
    return Math.floor(num / 10) + '.' + num % 10;
  }

  function getSet(link) {
    let major = Math.floor(link / 10);
    switch (link % 10) {
      case 0:
        return bitSets[major].bits;
      case 1:
        return bitSets[major].otherBits;
      case 2:
        return bitSets[major].resultBits;
    }
  }

  function postUpdate(name) {
    for (let i = name + 1; i < bitSets.length; i += 1) {
      if (bitSets[i].otherLink === name) {
        bitSets[i].updateOtherBits();
      }
    }
  }

  function spawnBitSet() {
    let name = bitSets.length;

    let elem = BIT_SET_PROTO.cloneNode(true);
    elem.removeAttribute('id');
    BIT_SETS_ELEM.appendChild(elem);

    let bitSet = new BitSet(name, 8, elem);
    bitSet.init();

    bitSets.push(bitSet);

    bitSet.refresh();

    return bitSet;
  }


  document.addEventListener('DOMContentLoaded', function () {
    let first = spawnBitSet(null);

    document.getElementById('add-row-btn').addEventListener('click', function () {
      spawnBitSet();
    });
  });
})();