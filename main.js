const $ = (name) => document.querySelector(name);
const $$ = (name) => document.querySelectorAll(name);

function initDrag() {
    [...$$(".heading-container")].forEach((container) => {
        let draggables = [...container.querySelectorAll(".column-heading")];

        draggables.forEach((elem) => {
            elem.addEventListener("touchstart", (e) => {
                elem.classList.add("dragging");
            });

            elem.addEventListener("touchend", (e) => {
                elem.classList.remove("dragging");

                elem.style.transform = "translateY(0px)";
            });
        });

        container.addEventListener("touchmove", (e) => {
            e.preventDefault();

            const scrollTop =
                window.pageYOffset !== undefined
                    ? window.pageYOffset
                    : (document.documentElement || document.body.parentNode || document.body).scrollTop;

            const dragging = container.querySelector(".dragging");

            dragging.style.transform = `translateY(${e.touches[0].clientY - dragging.offsetTop + scrollTop}px)`;

            const draggables = [...container.querySelectorAll(".column-heading:not(.dragging)")];

            const nextElem = draggables.find((elem) => e.touches[0].clientY <= elem.offsetTop - scrollTop - elem.offsetHeight / 5);

            if (nextElem) return container.insertBefore(dragging, nextElem);

            container.insertBefore(dragging, container.querySelector(".fixed-btn"));
        });
    });

    [...$$(".remove-heading-btn")].forEach((btn) => {
        btn.addEventListener("click", (e) => {
            btn.parentNode.parentNode.remove();
        });
    });
}
initDrag();

[...$$(".add-heading-btn")].forEach((btn) => {
    btn.addEventListener("click", (e) => {
        let node = btn.parentNode.parentNode.querySelector(".column-heading");

        if (!node) return btn.classList.contains("final-file") ? triggerFileSelect("final") : triggerFileSelect("source");

        let child = node.cloneNode(true);

        child.querySelector("p").innerHTML = "new heading";

        btn.parentNode.parentNode.insertBefore(child, btn.parentNode);

        initDrag();
    });
});

function triggerFileSelect(whichFile) {
    if (whichFile === "final") $("#final-csv-file").click();
    if (whichFile === "source") $("#source-csv-file").click();
}

function handleFile(input) {
    const file = input.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
        const data = e.target.result;
        const jsonData = csvJSON(data);
        console.log(jsonData);
        (input.classList.contains('source')) ? renderKeys(jsonData, 'source') : renderKeys(jsonData, 'final');

        initDrag();

        document.body.classList.add('uploaded');
    };

    reader.readAsText(file);

    console.log(file);
}

function csvJSON(csv) {
    var lines = csv.split("\n");

    var result = [];

    // NOTE: If your columns contain commas in their values, you'll need
    // to deal with those before doing the next step
    // (you might convert them to &&& or something, then covert them back later)
    // jsfiddle showing the issue https://jsfiddle.net/
    var headers = lines[0].split(",");

    for (var i = 1; i < lines.length; i++) {
        var obj = {};
        var currentline = lines[i].split(",");

        for (var j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentline[j];
        }

        result.push(obj);
    }

    //return result; //JavaScript object
    return result; //JSON
}

function renderKeys(data, whichColumn) {

    if(whichColumn === 'source') {

        Object.keys(data[0]).forEach(key => {

            $('.from-columns').insertBefore(createFromHeading(key), $('#fixed-btn-source-headings'));
        });
    }

    if(whichColumn === 'final') {

        Object.keys(data[0]).forEach(key => {

            $('.to-columns').insertBefore(createToHeading(key), $('#fixed-btn-final-headings'));
        });
    }
}

function createToHeading(heading) {
    const container = document.createElement("div");
    container.classList.add("to-heading", "column-heading");

    const paragraph = document.createElement("p");
    paragraph.textContent = heading;

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("btns", "flex");

    const removeButton = document.createElement("button");
    removeButton.classList.add("remove-heading-btn");

    const svgIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgIcon.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgIcon.setAttribute("width", "16");
    svgIcon.setAttribute("height", "16");
    svgIcon.setAttribute("fill", "currentColor");
    svgIcon.setAttribute("class", "bi bi-trash3-fill");
    svgIcon.setAttribute("viewBox", "0 0 16 16");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute(
        "d",
        "M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06Zm6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528ZM8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5"
    );

    svgIcon.appendChild(path);
    removeButton.appendChild(svgIcon);
    buttonContainer.appendChild(removeButton);

    container.appendChild(paragraph);
    container.appendChild(buttonContainer);

    return container;
}

function createFromHeading(heading) {
    const container = document.createElement("div");
    container.classList.add("from-heading", "column-heading");
    container.setAttribute("draggable", "true");

    const paragraph = document.createElement("p");
    paragraph.textContent = heading;

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("btns", "flex");

    const removeButton = document.createElement("button");
    removeButton.classList.add("remove-heading-btn");

    const svgIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgIcon.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgIcon.setAttribute("width", "16");
    svgIcon.setAttribute("height", "16");
    svgIcon.setAttribute("fill", "currentColor");
    svgIcon.setAttribute("class", "bi bi-trash3-fill");
    svgIcon.setAttribute("viewBox", "0 0 16 16");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute(
        "d",
        "M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06Zm6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528ZM8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5"
    );

    svgIcon.appendChild(path);
    removeButton.appendChild(svgIcon);
    buttonContainer.appendChild(removeButton);

    container.appendChild(paragraph);
    container.appendChild(buttonContainer);

    return container;
}