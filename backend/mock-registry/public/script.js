const DATA_URL = '/mock-registry/data/ngos.json';
const LOCATION_DATA_URL = '/data/indiaStatesDistricts.json';

const fields = ['sector', 'ngoType'];
const form = document.querySelector('#searchForm');
const resetButton = document.querySelector('#resetButton');
const results = document.querySelector('#results');
const resultCount = document.querySelector('#resultCount');
const stateSelect = document.querySelector('#state');
const districtSelect = document.querySelector('#district');

let registry = [];
let stateDistrictOptions = {};
window.registryReady = false;

const normalize = (value) => String(value || '').trim().toLowerCase();

const uniqueSorted = (items, field) => (
    [...new Set(items.map((item) => item[field]).filter(Boolean))].sort()
);

const fillSelect = (field) => {
    const select = document.querySelector(`#${field}`);
    const label = select.querySelector('option').textContent;
    select.innerHTML = `<option value="">${label}</option>`;

    uniqueSorted(registry, field).forEach((value) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
    });
};

const fillStateSelect = () => {
    stateSelect.innerHTML = '<option value="">All States</option>';

    Object.keys(stateDistrictOptions).forEach((state) => {
        const option = document.createElement('option');
        option.value = state;
        option.textContent = state;
        stateSelect.appendChild(option);
    });
};

const fillDistrictSelect = (state) => {
    districtSelect.innerHTML = '<option value="">All Districts</option>';
    districtSelect.disabled = !state;

    if (!state) return;

    (stateDistrictOptions[state] || []).forEach((district) => {
        const option = document.createElement('option');
        option.value = district;
        option.textContent = district;
        districtSelect.appendChild(option);
    });
};

const getCriteria = () => ({
    ngoName: document.querySelector('#ngoName').value,
    darpanId: document.querySelector('#darpanId').value,
    state: document.querySelector('#state').value,
    district: document.querySelector('#district').value,
    sector: document.querySelector('#sector').value,
    ngoType: document.querySelector('#ngoType').value
});

const matches = (ngo, criteria) => (
    (!criteria.ngoName || normalize(ngo.ngoName).includes(normalize(criteria.ngoName)))
    && (!criteria.darpanId || normalize(ngo.darpanId) === normalize(criteria.darpanId))
    && (!criteria.state || normalize(ngo.state) === normalize(criteria.state))
    && (!criteria.district || normalize(ngo.district) === normalize(criteria.district))
    && (!criteria.sector || normalize(ngo.sector) === normalize(criteria.sector))
    && (!criteria.ngoType || normalize(ngo.ngoType) === normalize(criteria.ngoType))
);

const renderResults = (items) => {
    resultCount.textContent = `${items.length} ${items.length === 1 ? 'record' : 'records'}`;
    results.innerHTML = '';

    if (items.length === 0) {
        results.innerHTML = '<div class="empty-state" data-testid="no-results">No matching NGO records found.</div>';
        return;
    }

    items.forEach((ngo) => {
        const card = document.createElement('article');
        card.className = 'result-card';
        card.dataset.testid = 'ngo-result';

        [
            ['NGO Name', 'ngoName'],
            ['Darpan ID', 'darpanId'],
            ['State', 'state'],
            ['District', 'district'],
            ['Sector', 'sector'],
            ['NGO Type', 'ngoType']
        ].forEach(([label, field]) => {
            const item = document.createElement('div');
            item.className = 'result-field';
            item.dataset.field = field;
            item.innerHTML = `<span>${label}</span><strong>${ngo[field]}</strong>`;
            card.appendChild(item);
        });

        results.appendChild(card);
    });
};

const runSearch = () => {
    renderResults(registry.filter((ngo) => matches(ngo, getCriteria())));
};

form.addEventListener('submit', (event) => {
    event.preventDefault();
    runSearch();
});

stateSelect.addEventListener('change', () => {
    fillDistrictSelect(stateSelect.value);
    districtSelect.value = '';
});

resetButton.addEventListener('click', () => {
    form.reset();
    fillDistrictSelect('');
    renderResults(registry);
});

Promise.all([
    fetch(DATA_URL).then((response) => {
        if (!response.ok) throw new Error('Unable to load registry data');
        return response.json();
    }),
    fetch(LOCATION_DATA_URL).then((response) => {
        if (!response.ok) throw new Error('Unable to load location data');
        return response.json();
    })
])
    .then(([items, locations]) => {
        registry = items;
        stateDistrictOptions = locations;
        fillStateSelect();
        fillDistrictSelect('');
        fields.forEach(fillSelect);
        renderResults(registry);
        window.registryReady = true;
    })
    .catch(() => {
        registry = [];
        renderResults([]);
        window.registryReady = true;
    });
