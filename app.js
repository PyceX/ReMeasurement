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
    
    // Формула с округлением
    const result = (1440 / minutes) * (v2 - v1) / 1000;
    return Math.round(result); 
};

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
        card.className = 'bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden';
        
        card.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <h3 class="font-bold text-xl text-gray-900">Скв. ${w.well}</h3>
                <div class="flex gap-3">
                    <button onclick="editWell('${w.id}')" class="text-blue-500 hover:text-blue-700 text-sm font-medium">Ред.</button>
                    <button onclick="deleteWell('${w.id}')" class="text-red-400 hover:text-red-600 text-sm font-medium">Удалить</button>
                </div>
            </div>
            
            <div class="space-y-2 mb-5">
                <div class="flex justify-between items-center bg-gray-50 p-2 rounded">
                    <span class="text-xs text-gray-500">Замер 1</span>
                    <div class="text-right">
                        <span class="font-mono font-medium text-gray-800">${w.v1}</span>
                        <span class="text-xs text-gray-400 block">${w.t1.replace('T', ' ')}</span>
                    </div>
                </div>
                ${hasSecond ? `
                <div class="flex justify-between items-center bg-gray-50 p-2 rounded">
                    <span class="text-xs text-gray-500">Замер 2</span>
                    <div class="text-right">
                        <span class="font-mono font-medium text-gray-800">${w.v2}</span>
                        <span class="text-xs text-gray-400 block">${w.t2.replace('T', ' ')}</span>
                    </div>
                </div>` : ''}
            </div>
            
            ${hasSecond ? `
                <div class="bg-blue-50 p-3 rounded-lg text-center border border-blue-100">
                    <span class="text-blue-600 text-[10px] font-bold uppercase tracking-wider block mb-1">Дебит</span>
                    <span class="text-3xl font-extrabold ${result === 'Ошибка времени' ? 'text-red-500 text-lg' : 'text-blue-900'}">
                        ${result} ${result !== 'Ошибка времени' ? '<span class="text-lg text-blue-600 font-medium">м³</span>' : ''}
                    </span>
                </div>
            ` : `
                <div class="border-t border-gray-100 pt-4 mt-2">
                    <label class="block text-xs text-gray-500 mb-1">Внести второй замер</label>
                    <div class="flex flex-col gap-2">
                        <input type="number" step="any" id="v2-${w.id}" placeholder="Показание 2" class="w-full border border-gray-200 bg-gray-50 p-2.5 rounded-lg text-sm outline-none focus:bg-white focus:ring-2 focus:ring-green-500 font-mono">
                        <input type="datetime-local" id="t2-${w.id}" value="${getLocalDatetime()}" class="w-full border border-gray-200 bg-gray-50 p-2.5 rounded-lg text-sm outline-none focus:bg-white focus:ring-2 focus:ring-green-500">
                        <button onclick="saveSecond('${w.id}')" class="w-full bg-green-500 text-white p-2.5 rounded-lg hover:bg-green-600 font-medium transition-colors shadow-sm mt-1">Рассчитать</button>
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

// Логика модального окна
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

renderCards();
