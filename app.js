let wells = JSON.parse(localStorage.getItem('wells')) || [];

const getLocalDatetime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
};

const saveWells = () => localStorage.setItem('wells', JSON.stringify(wells));

const calculateVolume = (v1, t1, v2, t2) => {
    if (!v2 || !t2) return null;
    const d1 = new Date(t1);
    const d2 = new Date(t2);
    const minutes = (d2 - d1) / 60000;
    
    if (minutes <= 0) return 'Ошибка времени';
    
    const result = (1440 / minutes) * (v2 - v1) / 1000;
    return Math.round(result); 
};

// Слушатели для отключения автообновления при ручном вводе первого замера
const time1Input = document.getElementById('time-1');
if (time1Input) {
    time1Input.addEventListener('focus', () => time1Input.classList.remove('auto-time'));
    time1Input.addEventListener('input', () => time1Input.classList.remove('auto-time'));
}

// Управление модальным окном добавления
window.openAddModal = () => {
    const time1 = document.getElementById('time-1');
    time1.value = getLocalDatetime();
    time1.classList.add('auto-time'); // Включаем автообновление при открытии
    document.getElementById('add-modal').classList.remove('hidden');
};

window.closeAddModal = () => {
    document.getElementById('add-modal').classList.add('hidden');
};

document.getElementById('add-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const newWell = {
        id: Date.now().toString(),
        well: document.getElementById('well-id').value,
        v1: parseFloat(document.getElementById('val-1').value),
        t1: document.getElementById('time-1').value,
        v2: '',
        t2: ''
    };
    wells.unshift(newWell);
    saveWells();
    renderCards();
    e.target.reset();
    closeAddModal(); 
});

const renderCards = () => {
    const container = document.getElementById('cards-container');
    container.innerHTML = '';

    wells.forEach(w => {
        const result = calculateVolume(w.v1, w.t1, w.v2, w.t2);
        const hasSecond = w.v2 !== '' && w.t2 !== '';
        
        const card = document.createElement('div');
        card.className = 'bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden flex flex-col gap-3';
        
        card.innerHTML = `
            <div class="flex justify-between items-center">
                <h3 class="font-bold text-lg text-gray-900 tracking-tight">Скв. ${w.well}</h3>
                <div class="flex gap-2">
                    <button onclick="editWell('${w.id}')" class="text-blue-500 hover:text-blue-700 text-xs font-semibold uppercase tracking-wide">Ред.</button>
                    <button onclick="deleteWell('${w.id}')" class="text-red-400 hover:text-red-600 text-xs font-semibold uppercase tracking-wide">Удал.</button>
                </div>
            </div>
            
            <div class="grid grid-cols-2 gap-2">
                <div class="bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <span class="text-[10px] text-gray-400 uppercase tracking-wide block mb-0.5">Замер 1</span>
                    <span class="font-mono font-bold text-gray-800 text-sm leading-none block">${w.v1}</span>
                    <span class="text-[10px] text-gray-500 mt-1 block">${w.t1.replace('T', ' ')}</span>
                </div>
                ${hasSecond ? `
                <div class="bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <span class="text-[10px] text-gray-400 uppercase tracking-wide block mb-0.5">Замер 2</span>
                    <span class="font-mono font-bold text-gray-800 text-sm leading-none block">${w.v2}</span>
                    <span class="text-[10px] text-gray-500 mt-1 block">${w.t2.replace('T', ' ')}</span>
                </div>` : `
                <div class="bg-gray-50 p-2 rounded-lg border border-gray-100 border-dashed flex items-center justify-center">
                    <span class="text-[10px] text-gray-400 text-center">Нет<br>данных</span>
                </div>
                `}
            </div>
            
            ${hasSecond ? `
                <div class="bg-blue-50 py-2 px-3 rounded-lg flex justify-between items-center border border-blue-100 mt-auto">
                    <span class="text-blue-600 text-xs font-bold uppercase tracking-wide">Дебит</span>
                    <div class="flex items-center gap-3">
                        <span class="text-2xl font-extrabold ${result === 'Ошибка времени' ? 'text-red-500 text-sm' : 'text-blue-900'}">
                            ${result} ${result !== 'Ошибка времени' ? '<span class="text-sm text-blue-600 font-medium ml-1">м³</span>' : ''}
                        </span>
                        ${result !== 'Ошибка времени' ? `
                        <button onclick="copyResult('${w.id}', this)" class="text-gray-400 hover:text-blue-600 focus:outline-none transition-colors" title="Копировать">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                            </svg>
                        </button>` : ''}
                    </div>
                </div>
            ` : `
                <div class="border-t border-gray-100 pt-3 mt-auto">
                    <div class="flex flex-col gap-2">
                        <div class="flex gap-2">
                            <input type="number" step="any" id="v2-${w.id}" placeholder="Показ. 2" class="w-1/2 border border-gray-200 bg-gray-50 p-2 rounded-lg text-sm outline-none focus:bg-white focus:ring-2 focus:ring-green-500 font-mono">
                            <input type="datetime-local" id="t2-${w.id}" value="${getLocalDatetime()}" class="w-1/2 border border-gray-200 bg-gray-50 p-2 rounded-lg text-xs outline-none focus:bg-white focus:ring-2 focus:ring-green-500 auto-time" onfocus="this.classList.remove('auto-time')" oninput="this.classList.remove('auto-time')">
                        </div>
                        <button onclick="saveSecond('${w.id}')" class="w-full bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 text-sm font-medium transition-colors shadow-sm">Рассчитать</button>
                    </div>
                </div>
            `}
        `;
        container.appendChild(card);
    });
};

window.copyResult = (id, btnElement) => {
    const w = wells.find(w => w.id === id);
    if (!w) return;
    const result = calculateVolume(w.v1, w.t1, w.v2, w.t2);
    if (result === 'Ошибка времени' || result === null) return;

    const formatTime = (t) => t.replace('T', ' ');
    const textToCopy = `${w.v1} (${formatTime(w.t1)}) - ${w.v2} (${formatTime(w.t2)}) = ${result} м³`;

    navigator.clipboard.writeText(textToCopy).then(() => {
        const originalHTML = btnElement.innerHTML;
        btnElement.innerHTML = '<span class="text-[10px] text-green-600 font-bold uppercase tracking-wide">Скопировано!</span>';
        setTimeout(() => { btnElement.innerHTML = originalHTML; }, 2000);
    }).catch(err => {
        console.error('Ошибка копирования', err);
    });
};

window.saveSecond = (id) => {
    const v2 = parseFloat(document.getElementById(`v2-${id}`).value);
    const t2 = document.getElementById(`t2-${id}`).value;
    if (isNaN(v2) || !t2) return alert('Укажите показание и время');
    
    const index = wells.findIndex(w => w.id === id);
    wells[index].v2 = v2;
    wells[index].t2 = t2;
    saveWells();
    renderCards();
};

window.deleteWell = (id) => {
    if(confirm('Удалить эту запись безвозвратно?')) {
        wells = wells.filter(w => w.id !== id);
        saveWells();
        renderCards();
    }
};

window.editWell = (id) => {
    const w = wells.find(w => w.id === id);
    if (!w) return;

    document.getElementById('edit-id').value = w.id;
    document.getElementById('edit-well-id').textContent = w.well;
    document.getElementById('edit-v1').value = w.v1;
    document.getElementById('edit-t1').value = w.t1;

    const secondGroup = document.getElementById('edit-second-group');
    if (w.v2 !== '' && w.t2 !== '') {
        secondGroup.classList.remove('hidden');
        document.getElementById('edit-v2').value = w.v2;
        document.getElementById('edit-t2').value = w.t2;
    } else {
        secondGroup.classList.add('hidden');
    }

    document.getElementById('edit-modal').classList.remove('hidden');
};

window.closeEditModal = () => {
    document.getElementById('edit-modal').classList.add('hidden');
};

window.saveEdit = () => {
    const id = document.getElementById('edit-id').value;
    const index = wells.findIndex(w => w.id === id);
    
    const newV1 = parseFloat(document.getElementById('edit-v1').value);
    const newT1 = document.getElementById('edit-t1').value;
    
    if (isNaN(newV1) || !newT1) return alert('Проверьте данные первого замера');

    wells[index].v1 = newV1;
    wells[index].t1 = newT1;

    if (wells[index].v2 !== '') {
        const newV2 = parseFloat(document.getElementById('edit-v2').value);
        const newT2 = document.getElementById('edit-t2').value;
        if (isNaN(newV2) || !newT2) return alert('Проверьте данные второго замера');
        
        wells[index].v2 = newV2;
        wells[index].t2 = newT2;
    }

    saveWells();
    renderCards();
    closeEditModal();
};

// Обновляем время каждые 10 секунд
setInterval(() => {
    const currentDatetime = getLocalDatetime();
    document.querySelectorAll('.auto-time').forEach(el => {
        el.value = currentDatetime;
    });
}, 10000);

renderCards();
