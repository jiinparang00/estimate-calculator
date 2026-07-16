/* ============================
   추가 옵션 항목 선택
============================ */

const optionItems = document.querySelectorAll(".option-item-with-quantity");

optionItems.forEach((item) => {
    const checkbox = item.querySelector(".option-checkbox");
    const quantity = item.querySelector(".option-quantity");

    // 수량 입력이 있는 항목만 처리
    if (!quantity) return;

    quantity.style.display = "none";

    checkbox.addEventListener("change", () => {
        quantity.style.display = checkbox.checked ? "flex" : "none";

        if (!checkbox.checked) {
            const quantityInput =
                quantity.querySelector('input[type="number"]');

            if (quantityInput) {
                quantityInput.value = 1;
            }
        }

        calculateEstimate();
    });
});

/* ============================
   공통 함수
============================ */

function applyNumberInputRules(input, min = 1, max = Infinity) {
    input.addEventListener("keydown", (event) => {
        if (
            event.key === "-" ||
            event.key === "+" ||
            event.key.toLowerCase() === "e"
        ) {
            event.preventDefault();
        }
    });

    input.addEventListener("input", () => {
        // 사용자가 값을 전부 지운 경우에는 공란 유지
        if (input.value === "") {
            return;
        }

        let value = Number(input.value);

        if (value < min) {
            value = min;
        }

        if (value > max) {
            value = max;
        }

        input.value = value;
    });
}

/* ============================
   신청 유형 선택
============================ */

const workTypeCards = document.querySelectorAll(".work-type-card");

workTypeCards.forEach(card => {
    card.addEventListener("click", () => {

        workTypeCards.forEach(item => {
            item.classList.remove("active");
        });

        card.classList.add("active");

        updateLengthMode();
        calculateEstimate();
    });
});

/* ============================
   희망 영상 길이 연동
============================ */

const lengthNumber = document.querySelector("#length-number");
const lengthRange = document.querySelector("#length-range");
const lengthTitle = document.querySelector("#length-title");
const lengthUnit = document.querySelector("#length-unit");
const lengthGuide = document.querySelector("#length-guide");

// 작업 유형별 마지막 값 기억
let savedLongformLength = 10;
let savedShortsCount = 1;

applyNumberInputRules(lengthNumber, 1, 60);

lengthRange.addEventListener("input", () => {
    lengthNumber.value = lengthRange.value;

    savedLongformLength = Number(lengthRange.value);

    calculateEstimate();
});

lengthNumber.addEventListener("input", () => {
    if (lengthNumber.value === "") {
        return;
    }

    const activeCard = document.querySelector(".work-type-card.active");
    const workType = activeCard?.dataset.type;

    const value = Number(lengthNumber.value);

    if (workType === "shorts") {
        savedShortsCount = value;
    } else {
        savedLongformLength = value;
        lengthRange.value = Math.min(value, 60);
    }

    calculateEstimate();
});

lengthNumber.addEventListener("blur", () => {
    if (lengthNumber.value === "") {
        return;
    }

    let value = Number(lengthNumber.value);

    if (value > 60) {
        value = 60;
    }

    lengthNumber.value = value;
    lengthRange.value = value;

    calculateEstimate();
});

/* ============================
   기본 견적 계산
============================ */

const estimatePrice = document.querySelector("#estimate-price");
const estimateWorkType = document.querySelector("#estimate-work-type");
const estimateAmountLabel = document.querySelector("#estimate-amount-label");
const estimateAmount = document.querySelector("#estimate-amount");
const estimateBasePrice = document.querySelector("#estimate-base-price");
const estimateUnitPrice = document.querySelector("#estimate-unit-price");
const estimateOptionList = document.querySelector("#estimate-option-list");
const estimateOptionTotal = document.querySelector("#estimate-option-total");

function calculateEstimate() {
    const activeCard = document.querySelector(".work-type-card.active");

    if (!activeCard || lengthNumber.value === "") {
        estimateWorkType.textContent = "-";
        estimateAmountLabel.textContent = "영상 길이";
        estimateAmount.textContent = "-";
        estimateUnitPrice.textContent = "-";
        estimateBasePrice.textContent = "0원";
        estimatePrice.textContent = "0원";
        return;
    }

    const workType = activeCard.dataset.type;
    const workTypeName = activeCard.querySelector("strong").textContent;
    const unitPrice = Number(activeCard.dataset.price);
    const amountValue = Number(lengthNumber.value);

    // 기본 금액
    const basePrice = unitPrice * amountValue;
    let totalPrice = basePrice;
    let optionTotalPrice = 0;

    // 결과 영역 기본 정보
    estimateWorkType.textContent = workTypeName;

    if (workType === "shorts") {
        estimateUnitPrice.textContent =
            `${unitPrice.toLocaleString()}원 / 건`;

        estimateAmountLabel.textContent = "신청 개수";
        estimateAmount.textContent = `${amountValue}개`;
    } else {
        estimateUnitPrice.textContent =
            `${unitPrice.toLocaleString()}원 / 분`;

        estimateAmountLabel.textContent = "희망 길이";
        estimateAmount.textContent = `${amountValue}분`;
    }

    estimateBasePrice.textContent = `${basePrice.toLocaleString()}원`;

    // 추가 옵션 금액 및 내역
    const optionItems = document.querySelectorAll(".option-item");

    estimateOptionList.innerHTML = "";
    let selectedOptionCount = 0;

    optionItems.forEach((item) => {
        const checkbox = item.querySelector('input[type="checkbox"]');

        if (!checkbox || !checkbox.checked) {
            return;
        }

        selectedOptionCount += 1;

        const optionPrice = Number(item.dataset.price);
        let optionName = item
            .querySelector(".option-text strong")
            .textContent
            .trim();

        optionName = optionName.replace(/\(.*?\)/g, "").trim();

        const quantityInput = item.querySelector(
            '.option-quantity input[type="number"]'
        );

        let optionTotal = optionPrice;
        let optionLabel = optionName;

        if (quantityInput) {
            const quantity = Number(quantityInput.value) || 0;

            optionTotal = optionPrice * quantity;
            optionLabel = `${optionName} ×${quantity}`;
        }

        optionTotalPrice += optionTotal;
        totalPrice += optionTotal;

        const optionRow = document.createElement("div");
        optionRow.classList.add("estimate-option-row");

        optionRow.innerHTML = `
            <span>${optionLabel}</span>
            <strong>+${optionTotal.toLocaleString()}원</strong>
        `;

        estimateOptionList.appendChild(optionRow);
    });

    if (selectedOptionCount === 0) {
        estimateOptionList.innerHTML = `
            <p class="estimate-empty">
                선택한 추가 옵션이 없습니다.
            </p>
        `;
    }

    estimateOptionTotal.textContent = `${optionTotalPrice.toLocaleString()}원`;
    estimatePrice.textContent = `${totalPrice.toLocaleString()}원`;
}

/* ============================
   롱폼 / 쇼츠 입력 방식 전환
============================ */

function updateLengthMode() {
    const activeCard = document.querySelector(".work-type-card.active");
    const workType = activeCard.dataset.type;

    if (workType === "shorts") {
        lengthTitle.textContent = "▪ 신청 개수";
        lengthUnit.textContent = "개";
        lengthGuide.textContent = "숫자를 직접 입력해 주세요"

        lengthRange.style.display = "none";

        lengthNumber.min = "1";
        lengthNumber.removeAttribute("max");

        lengthNumber.value = savedShortsCount;

    } else {
        lengthTitle.textContent = "▪ 희망 영상 길이";
        lengthUnit.textContent = "분";
        lengthGuide.textContent = "슬라이더를 움직이거나 숫자를 직접 입력해 주세요"

        lengthRange.style.display = "";

        lengthNumber.min = "1";
        lengthNumber.max = "60";

        lengthNumber.value = savedLongformLength;
        lengthRange.value = savedLongformLength;

        if (Number(lengthNumber.value) > 60) {
            lengthNumber.value = "60";
        }

        if (lengthNumber.value !== "") {
            lengthRange.value = lengthNumber.value;
        }
    }
}

calculateEstimate();

const allOptionCheckboxes = document.querySelectorAll(
    '.option-item input[type="checkbox"]'
);

allOptionCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", calculateEstimate);
});

const optionQuantityInputs = document.querySelectorAll(
    '.option-quantity input[type="number"]'
);

optionQuantityInputs.forEach((input) => {
    applyNumberInputRules(input, 1);

    input.addEventListener("input", calculateEstimate);
});

/* ==========================
   견적서 클립보드 복사
========================== */

const contactButton = document.querySelector("#contact-button");

contactButton.addEventListener("click", async () => {
    const workType = estimateWorkType.textContent.trim();
    const amountLabel = estimateAmountLabel.textContent.trim();
    const amount = estimateAmount.textContent.trim();
    const unitPrice = estimateUnitPrice.textContent.trim();
    const basePrice = estimateBasePrice.textContent.trim();
    const optionTotal = estimateOptionTotal.textContent.trim();
    const totalPrice = estimatePrice.textContent.trim();

    const optionRows =
        estimateOptionList.querySelectorAll(".estimate-option-row");

    const optionLines = Array.from(optionRows).map((row) => {
        const optionName =
            row.querySelector("span")?.textContent.trim() ?? "";

        const optionPrice =
            row.querySelector("strong")?.textContent.trim() ?? "";

        return `- ${optionName}: ${optionPrice}`;
    });

    const optionsText =
        optionLines.length > 0
            ? optionLines.join("\n")
            : "- 선택한 추가 옵션 없음";

    const copyText = `[예상 견적서]

신청 유형: ${workType}
${amountLabel}: ${amount}
기본 단가: ${unitPrice}
총 기본 금액: ${basePrice}

추가 옵션
${optionsText}
총 추가 금액: ${optionTotal}

총 예상 금액: ${totalPrice}`;

    try {
        await navigator.clipboard.writeText(copyText);

        contactButton.textContent = "복사 완료";

        setTimeout(() => {
            contactButton.textContent = "견적서 복사";
        }, 1500);
    } catch (error) {
        console.error("클립보드 복사 실패:", error);
        alert("복사에 실패했습니다. 다시 시도해 주세요.");
    }
});

/* ==========================
   선택 초기화
========================== */

const resetEstimateButton =
    document.querySelector("#reset-estimate");

resetEstimateButton.addEventListener("click", () => {
    // 작업 유형을 첫 번째 카드로 초기화
    workTypeCards.forEach((card) => {
        card.classList.remove("active");
    });

    const defaultWorkTypeCard = workTypeCards[0];
    defaultWorkTypeCard.classList.add("active");

    // 작업 유형별 저장값 초기화
    savedLongformLength = 10;
    savedShortsCount = 1;

    // 현재 길이 입력값 초기화
    lengthNumber.value = 10;
    lengthRange.value = 10;

    // 모든 추가 옵션 체크 해제
    allOptionCheckboxes.forEach((checkbox) => {
        checkbox.checked = false;
    });

    // 수량이 있는 추가 옵션은 1로 초기화하고 입력칸 숨김
    optionItems.forEach((item) => {
        const quantity = item.querySelector(".option-quantity");

        const quantityInput =
            quantity?.querySelector('input[type="number"]');

        if (quantityInput) {
            quantityInput.value = 1;
        }

        if (quantity) {
            quantity.style.display = "none";
        }
    });

    // 롱폼 UI로 전환하고 견적 다시 계산
    updateLengthMode();
    calculateEstimate();
});

/* ==========================
   iframe 높이 자동 전달
========================== */

function sendIframeHeight() {
    const height = document.documentElement.scrollHeight;

    window.parent.postMessage(
        {
            type: "estimate-calculator-height",
            height: height
        },
        "*"
    );
}

// 처음 로드됐을 때
window.addEventListener("load", sendIframeHeight);

// 화면 크기가 바뀔 때
window.addEventListener("resize", sendIframeHeight);

// 옵션 체크, 수량칸 표시 등으로 높이가 바뀔 때
const resizeObserver = new ResizeObserver(() => {
    sendIframeHeight();
});

resizeObserver.observe(document.body);