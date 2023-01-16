HTMLElement.prototype.QS = function(el, func) {return func ? this.shadowRoot.querySelectorAll(el).forEach(func) : this.shadowRoot.querySelector(el);}
HTMLElement.prototype.Q = function(el, func) {return func ? this.querySelectorAll(el).forEach(func) : this.querySelector(el);}
HTMLElement.prototype.Qmap = function(el, func) {return [...this.querySelectorAll(el)].map(func);}
HTMLElement.prototype.create = function(tag, attr) {
    const el = document.createElement(tag);
    attr && Object.entries(attr).forEach(([attr, value]) => value && (el[attr] = value));
    return el;
}
customElements.define('mkass-quiz', class extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'}).innerHTML = `
        <link href=/static/MKASS/quiz.css rel=stylesheet>
        <dl></dl>
        <div id=select></div>
        <slot name=question></slot>
        <div id=buttons>
            <button hidden>刷新數學顯示</button>
            <label id=next></label>
        </div>`;
        setTimeout(() => this.arrange());
    }
    arrange() {
        this.questions.forEach((q, i) => {
            this.QS('#select').append(
                this.create('input', {type: 'radio', name: 'select', id: q.q, onchange: ev => this.selecting(ev.target.id)}),
                this.create('label', {htmlFor: q.q, innerText: i + 1})
            );
            q.arrange();
        });
        this.QS('input[name=select]:first-of-type').click();
    }
    selecting(q) {
        this.questions.forEach(question => question[question.q == q ? 'focus' : 'blur']());
        this.QS('#next').htmlFor = this.QS(`label[for='${q}']+input`)?.id ?? '';
        setFrameHeight();
    }
    serialize() {
        const report = this.questions.map(question => ({
            q: question.q,
            choices: question.Qmap('div.choices', div => Math.round(parseFloat(div.id)%1*10)),
            a: Math.round(parseFloat(question.a)%1*10),
            spent: Math.round(question.spent*10)/10,
            blurred: question.blurred,
            trace: question.trace.map(c => Math.round(parseFloat(c%1)*10))
        }));
        return report;
    }
    connectedCallback() {
        this.QS('button').onclick = () => this.mathjax();
        if (this.getAttribute('state') != 'report') return;
        const [scored, blurred, spent] = ['scored', 'blurred', 'spent'].map(item => this.questions.reduce((total, question) => total += parseInt(question[item]), 0));
        this.QS('dl').innerHTML = `<dt>失焦<dd>${blurred}<dt>時間<dd>${Math.round(spent/6)/10}分<dt>成績<dd>${scored*10}%`;
    }
    mathjax() {
        MathJax.Hub.Typeset();
    }
    attributeChangedCallback(attr, _, current) {
        if (current != 'report') return;
        this.QS('#select label', label =>
            this.questions.find(question => question.q == label.htmlFor).QS('input:checked')?.parentNode.classList.add(label.matches('.scored') ? 'scored' : 'missed')
        );
    }
    static observedAttributes = ['state'];
});
customElements.define('mkass-question', class extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'}).innerHTML = `
        <link href=/static/MKASS/quiz.css rel=stylesheet>
        <dl></dl>
        <slot></slot>
        <div id=buttons>
            <button id=answer>查看答案</button>
            <button id=solution>查看解答</button>
        </div>`;
        this.spent = this.blurred = 0, this.trace = [];
    }
    get q() {return this.getAttribute('q');}
    set q(q) {this.setAttribute('q', q);}
    get a() {return this.getAttribute('a');}
    get scored() {return this.getAttribute('scored');}
    //get blurred() {return this.getAttribute('blur');}
    get duration() {return this.getAttribute('duration');}
    arrange() {
        const alphabet = 'ABCD';
        this.scored && this.showFootprint();
        this.Q('div.choices', (div, i) => {
            const choice = this.create('div');
            choice.append(
                this.create('input', {type: 'radio', name: this.q, id: div.id, checked: this.a == div.id, onchange: ev => this.answer(ev.target.id)}),
                this.create('label', {htmlFor: div.id, innerHTML: `<slot name=${alphabet[i]}></slot>`})
            );
            this.QS('#buttons').before(choice);
            div.slot = alphabet[i];
            choice.after(this.create('slot', {name: `feedback${alphabet[i]}`}));
        });
        this.QS('#answer').onclick = () => this.get('answer');
        this.QS('#solution').onclick = () => this.get('solution');
    }
    answer(choice) {
        this.setAttribute('a', choice);
        this.trace.push(choice);
        Q('mkass-quiz').QS(`label[for='${this.q}']`).classList.add('answered');
    }
    blur(tabSwitched) {
        tabSwitched && ++this.blurred || this.classList.remove('doing');
        this.lastFocus && (this.spent += (Date.now() - this.lastFocus) / 1000);
    }
    focus() {
        this.classList.add('doing');
        this.lastFocus = Date.now();
    }
    showFootprint() {
        this.QS('dl').innerHTML = `<dt>失焦<dd>${this.blurred}<dt>時間<dd>${this.spent}秒`;
        this.getAttribute('trace');
    }
    get(which) {
        const quizId = this.parentElement.getAttribute('quizId');
        if (!quizId || which == 'answer' && this.QS('.scored') || which == 'solution' && this.Q('div[slot^=feedback]'))
            return;
        fetch(`http://maple.com:3000/${document.title}/${this.q}/${which}/${quizId}`, { credentials: 'include' })
            .then(resp => resp.json()).then(([stuff]) => {
                which == 'answer' ?
                    this.QS(`label[for='${this.q}.${stuff.answer}']`).parentNode.classList.add('scored') :
                    Object.entries(stuff).forEach(([choice, fb]) =>
                        this.append(this.create('div', { innerHTML: fb, slot: `feedback${this.Q(`div[id$='${choice}']`).slot}` }))
                    );
                this.parentElement.mathjax();
            });
    }
});