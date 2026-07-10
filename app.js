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
    return result.toFixed(2); // Округление до сотых
};

// Инициализация формы
document.getElementById('time-1').value = getLocalDatetime();

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
    document.getElementById('time-1').value = getLocalDatetime();
});

const renderCards = () => {
    const container = document.getElementById('cards-container');
    container.innerHTML = '';

    wells.forEach(w => {
        const result = calculateVolume(w.v1, w.t1, w.v2, w.t2);
        const hasSecond = w.v2 !== '' && w.t2 !== '';
        
        const card = document.createElement('div');
        card.className = 'bg-white p-4 rounded shadow-sm border border-gray-200';
        
        card.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <h3 class="font-bold text-lg text-blue-900">Скв. ${w.well}</h3>
                <button onclick="deleteWell('${w.id}')" class="text-red-500 hover:text-red-700 text-sm">Удалить</button>
            </div>
            
            <div class="text-sm space-y-1 mb-4 text-gray-700">
                <p>1-й замер: <span class="font-mono">${w.v1}</span> (${w.t1.replace('T', ' ')})</p>
                ${hasSecond ? `<p>2-й замер: <span class="font-mono">${w.v2}</span> (${w.t2.replace('T', ' ')})</p>` : ''}
            </div>
            
            ${hasSecond ? `
                <div class="bg-gray-50 p-2 rounded text-center border">
                    <span class="text-gray-500 text-xs uppercase block">Результат</span>
                    <span class="text-xl font-bold ${result === 'Ошибка времени' ? 'text-red-500' : 'text-green-600'}">${result} ${result !== 'Ошибка времени' ? 'м³' : ''}</span>
                </div>
                <button onclick="editWell('${w.id}')" class="mt-3 w-full border border-gray-300 text-gray-700 p-1.5 rounded hover:bg-gray-50 text-sm">Изменить</button>
            ` : `
                <div class="mt-2 border-t pt-2 space-y-2">
                    <input type="number" step="any" id="v2-${w.id}" placeholder="Показание 2 (A8)" class="w-full border p-2 rounded text-sm outline-none focus:border-blue-500">
                    <input type="datetime-local" id="t2-${w.id}" value="${getLocalDatetime()}" class="w-full border p-2 rounded text-sm outline-none focus:border-blue-500">
                    <div class="flex gap-2">
                        <button onclick="saveSecond('${w.id}')" class="flex-1 bg-green-600 text-white p-2 rounded hover:bg-green-700 text-sm">Рассчитать</button>
                        <button onclick="editWell('${w.id}')" class="flex-1 border border-gray-300 p-2 rounded hover:bg-gray-50 text-sm">Изменить все</button>
                    </div>
                </div>
            `}
        `;
        container.appendChild(card);
    });
};

window.saveSecond = (id) => {
    const v2 = parseFloat(document.getElementById(`v2-${id}`).value);
    const t2 = document.getElementById(`t2-${id}`).value;
    if (isNaN(v2) || !t2) return alert('Введите данные 2-го замера');
    
    const index = wells.findIndex(w => w.id === id);
    wells[index].v2 = v2;
    wells[index].t2 = t2;
    saveWells();
    renderCards();
};

window.deleteWell = (id) => {
    if(confirm('Удалить запись?')) {
        wells = wells.filter(w => w.id !== id);
        saveWells();
        renderCards();
    }
};

window.editWell = (id) => {
    const index = wells.findIndex(w => w.id === id);
    const w = wells[index];
    
    const newWell = prompt('Номер скважины:', w.well);
    if (newWell === null) return;
    
    const newV1 = parseFloat(prompt('Показание 1:', w.v1));
    const newT1 = prompt('Время 1 (YYYY-MM-DDTHH:MM):', w.t1);
    
    wells[index].well = newWell || w.well;
    wells[index].v1 = isNaN(newV1) ? w.v1 : newV1;
    wells[index].t1 = newT1 || w.t1;
    
    if (w.v2 !== '') {
        const newV2 = parseFloat(prompt('Показание 2:', w.v2));
        const newT2 = prompt('Время 2 (YYYY-MM-DDTHH:MM):', w.t2);
        wells[index].v2 = isNaN(newV2) ? w.v2 : newV2;
        wells[index].t2 = newT2 || w.t2;
    }
    
    saveWells();
    renderCards();
};

renderCards();
