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
        const hasSecond = w.v2 !== '';
        
        const card = document.createElement('div');
        card.className = 'bg-white p-4 rounded-xl border border-slate-200 shadow-sm';
        
        card.innerHTML = `
            <div class="flex justify-between items-center mb-3 border-b pb-2">
                <span class="font-bold text-lg text-slate-800">№ ${w.well}</span>
                <div class="flex gap-3">
                    <button onclick="editWell('${w.id}')" class="text-xs text-slate-400 hover:text-slate-800 font-bold uppercase">Ред</button>
                    <button onclick="deleteWell('${w.id}')" class="text-xs text-red-400 hover:text-red-700 font-bold uppercase">Удал</button>
                </div>
            </div>
            <div class="text-sm text-slate-600 mb-4 space-y-1">
                <p>Замер 1: <span class="font-mono font-medium">${w.v1}</span> <span class="text-slate-400 text-xs">(${w.t1.replace('T', ' ')})</span></p>
                ${hasSecond ? `<p>Замер 2: <span class="font-mono font-medium">${w.v2}</span> <span class="text-slate-400 text-xs">(${w.t2.replace('T', ' ')})</span></p>` : ''}
            </div>
            ${hasSecond ? `
                <div class="bg-slate-800 text-white p-4 rounded-xl text-center">
                    <span class="text-[10px] tracking-widest opacity-60 uppercase block mb-1">Расход м³</span>
                    <span class="text-3xl font-black">${result}</span>
                </div>
            ` : `
                <div class="space-y-2 pt-2 border-t">
                    <input type="number" id="v2-${w.id}" placeholder="Показание 2" class="w-full border p-3 rounded-lg text-sm">
                    <input type="datetime-local" id="t2-${w.id}" class="w-full border p-3 rounded-lg text-sm">
                    <button onclick="saveSecond('${w.id}')" class="w-full bg-emerald-600 text-white p-3 rounded-lg text-sm font-bold">Рассчитать</button>
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
