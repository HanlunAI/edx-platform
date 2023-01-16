document.body.append(createElement('button', {onclick: () => startQuiz(), innerText: '開始評估'}));
const startQuiz = () => 
    fetch(`http://maple.com:3000/${document.title}`, {credentials: 'include'})
    .then(async resp => {
        let questions = await resp.json();
        if (resp.status != 200)
            return Promise.reject({code: resp.status, content: questions});

        let quiz;
        Q('button').remove();
        document.body.append(
            quiz = createElement('mkass-quiz'),
            createElement('script', {
                src: `https://code.jquery.com/jquery-2.2.4.min.js`, 
                onload: () => document.body.append(createElement('script', {src: `/static/MKASS/shared/js/hil_main.js`}))
            }),
        );
        quiz.QS('#buttons').append(createElement('button', {onclick: () => submitQuiz(quiz), innerText: '交'}));
        questions.forEach(q => quiz.append(
            createElement('mkass-question', {
                slot: 'question', q: q.q,
                innerHTML: q.question + shuffle([1, 2, 3, 4], q.c4_fixed).map(c => `<div id=${q.q}.${c} class=choices>${q[`c${c}`]}</div>`).join('')
            })
        ));
        quiz.questions = [...quiz.querySelectorAll('mkass-question')];
        tabSwitchEvents({
            hidden: () => quiz.questions.find(q => q.matches('.doing')).blur(true), 
            visible: () => quiz.questions.find(q => q.matches('.doing')).focus()
        });
    }).catch(async er => er.code == 403 ? notifyPrereq(await er.content) : console.error(er));

const submitQuiz = async quiz => {
    //if (quiz.Q('#select label:not(.answered)'))
    //    return Q('button').after('尚未完成作答');
    quiz.questions.forEach(question => question.blur());
    const resp = await fetchMethod(`${domain.name}:3000/${document.title}`, quiz.serialize());
    if (resp.status == 401) 
        return loginAgain();
    //if (resp.status != 200) {
    //    localStorage.setItem('quiz', quiz.serialize());
    //    return apologize();
    //}
    const results = await resp.json();
    results.scored.forEach(({ q }) => {
        quiz.QS(`label[for='${q}']`).classList.add('scored');
        quiz.Q(`mkass-question[q='${q}']`).setAttribute('scored', true);
    });
    const score = results.scored.length / quiz.querySelectorAll('mkass-question').length * 100;
    quiz.QS('dl').innerHTML = `<dt>分數<dd>${score}%<dd class=${score >= 80 ? 'passed' : 'failed'}>${score >= 80 ? '已達標' : '未達標'}`;
    quiz.setAttribute('state', 'report');

    quiz.QS('#buttons :last-child').remove();
    quiz.setAttribute('quizId', results.quizId);
    quiz.QS('input[name=select]:first-of-type').click();
}
const shuffle = (array, fixLast) => {
    let currentIndex = fixLast ? array.length - 1 : array.length, randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}