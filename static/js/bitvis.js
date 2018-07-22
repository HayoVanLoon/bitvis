'use strict';

(function(){

  const BIT_SETS_ELEM = document.getElementById('bit-sets');
  const BIT_SET_PROTO = document.getElementById('bit-set-div-proto');

  let bitSets = [];

  class BitSet {
    constructor(name, size, elem, next) {
      this.name = name;
      this.bits = [];
      this.otherBits = [];

      for (let i = 0; i < size; i += 1) {
        this.bits.push(0);
        this.otherBits.push(0);
      }

      this.otherRef = null;

      this.elem = elem;
      this.buttons = this.elem.getElementsByClassName('bit-btn');
      this.otherButtons = this.elem.getElementsByClassName('other-bit-btn');

      this.next = next;
      this.op = null;
    }

    init() {
      let self = this;
      for (let i = 0; i < this.bits.length; i += 1) {
        this.buttons[i].addEventListener('click', function(){ self.flipBit(i); });
        this.otherButtons[i].addEventListener('click', function(){ self.flipOtherBit(i); });
      }

      let ops = this.elem.getElementsByClassName('bit-ops');
      for (let i = 0; i < ops.length; i += 1) {
        ops[i].name = 'bit-ops-' + name;
        if (ops[i].classList.contains('invert-bit-op')) {
          ops[i].addEventListener('change', function(){
            if (ops[i].value) { self.setOp(self.invert); }
          });
        } else if (ops[i].classList.contains('shiftright-bit-op')) {
          ops[i].addEventListener('change', function(){
            if (ops[i].value) { self.setOp(self.shiftRight); }
          });
        } else if (ops[i].classList.contains('shiftleft-bit-op')) {
          ops[i].addEventListener('change', function(){
            if (ops[i].value) { self.setOp(self.shiftLeft); }
          });
        } else if (ops[i].classList.contains('xor-bit-op')) {
          ops[i].addEventListener('change', function(){
            if (ops[i].value) { self.setOp(self.xor); }
          });
        }
      }

      let allToZero = this.elem.getElementsByClassName('all-zero-btn')[0];
      allToZero.addEventListener('click', allToHandler(self, 0));
      let allToOne = this.elem.getElementsByClassName('all-one-btn')[0];
      allToOne.addEventListener('click', allToHandler(self, 1));

      this.refresh();
    }

    setBit(index, value) {
      this.bits[index] = value;
      this.buttons[index].innerText = value;
      this.propagateChange(index);
    }

    setOtherBit(index, value) {
      this.otherBits[index] = value;
      this.otherButtons[index].innerText = value;
      this.propagateChange(index);
    }

    setNext(next) {
      this.next = next;
      this.refresh();
    }

    setOp(func) {
      this.op = func;
      this.refresh();
      this.propagateChange(-1);
    }

    flipBit(index) {
      this.setBit(index, 1 - this.bits[index]);
    }

    flipOtherBit(index) {
      this.setOtherBit(index, 1 - this.otherBits[index]);
    }

    propagateChange(index) {
      if (!!this.op) {
        if (-1 < index && index < this.bits.length) {
          this.op(index);
        } else {
          for (let i = 0; i < this.bits.length; i += 1) {
            this.op(i);
          }
        }
      }
    }

    refresh() {
      this.elem.getElementsByClassName('bit-set-name-span')[0].innerText = this.name;

      for (let i = 0; i < this.buttons.length; i += 1) {
        this.buttons[i].innerText = this.bits[i];
        this.otherButtons[i].innerText = this.otherBits[i];
        if (this.name > 0) {
          this.buttons[i].disabled = true;
          this.otherButtons[i].disabled = true;
        }
      }

      this.elem.getElementsByClassName('other-bits-div')[0].hidden = !(this.op === this.xor);

      this.elem.getElementsByClassName('ops-div')[0].hidden = !this.next;
      this.elem.getElementsByClassName('bit-controls-div')[0].hidden = this.name > 0;
    }

    invert(index) {
      if (!!this.next) {
        this.next.setBit(index, 1 - this.bits[index]);
        this.next.propagateChange(index);
      }
    }

    shiftRight(index) {
      if (!!this.next) {
        if (index === this.bits.length - 1) {
          this.next.setBit(0, 0)
        } else {
          this.next.setBit(index+1, this.bits[index]);
        }
        this.next.propagateChange(index+1);
      }
    }

    shiftLeft(index) {
      if (!!this.next) {
        if (index === 0) {
          this.next.setBit(this.bits.length - 1, 0)
        } else {
          this.next.setBit(index-1, this.bits[index]);
        }
        this.next.propagateChange(index-1);
      }
    }

    xor(index) {
      if (!!this.next) {
        this.next.setBit(index, this.bits[index] ^ this.otherBits[index]);
        this.next.propagateChange(index);
      }
    }
  }

  function allToHandler(bitSet, value) {
    return function() {
      for (let i = 0; i < bitSet.bits.length; i += 1) {
        bitSet.setBit(i, value);
      }
      bitSet.propagateChange();
    }
  }

  function spawnBitSet() {
    let name = bitSets.length;

    let elem = BIT_SET_PROTO.cloneNode(true);
    elem.removeAttribute('id');
    BIT_SETS_ELEM.appendChild(elem);

    let bitSet = new BitSet(name, 8, elem, null);
    bitSet.init();

    if (bitSets.length > 0) {
      bitSets[name - 1].setNext(bitSet);
      bitSets[name - 1].propagateChange(-1);
    }
    bitSets.push(bitSet);

    bitSet.refresh();

    return bitSet;
  }


  document.addEventListener('DOMContentLoaded', function(){
    let first = spawnBitSet(null);
    let second = spawnBitSet(null);

    document.getElementById('add-row-btn').addEventListener('click', function(){
      spawnBitSet();
    });
  });
})();