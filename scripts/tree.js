
/* =========================================================
   SETUP
========================================================= */

const viewport = document.getElementById("tree-viewport");
const canvas = document.getElementById("tree-canvas");
const lines = document.getElementById("tree-lines");


/* =========================================================
   SVG LINE HELPER
========================================================= */

function makeLine(x1, y1, x2, y2) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");

    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);

    line.setAttribute("stroke", "#b8a27a");
    line.setAttribute("stroke-width", "4");

    return line;
}


/* =========================================================
   CANVAS POSITION HELPER
========================================================= */

function getCanvasPosition(card) {
    let x = parseInt(card.style.left) || 0;
    let y = parseInt(card.style.top) || 0;

    let parent = card.parentElement;

    while (parent && parent !== canvas) {
        x += parseInt(parent.style.left) || 0;
        y += parseInt(parent.style.top) || 0;
        parent = parent.parentElement;
    }

    return { x, y };
}

/* =========================================================
   RELATIONSHIP ANCHOR HELPER
========================================================= */

function getRelationshipAnchor(parentId) {

    if (parentId.includes(",")) {
        const parentIds = parentId.split(",").map(id => id.trim());

        const parentCards = parentIds
            .map(id => document.querySelector(`[data-id="${id}"]`))
            .filter(card => card);

        if (parentCards.length < 2) return null;

        const firstPos = getCanvasPosition(parentCards[0]);
        const secondPos = getCanvasPosition(parentCards[1]);

        const firstCenterX = firstPos.x + parentCards[0].offsetWidth / 2;
        const secondCenterX = secondPos.x + parentCards[1].offsetWidth / 2;

        const centerY = firstPos.y + parentCards[0].offsetHeight / 2;

        return {
            x: (firstCenterX + secondCenterX) / 2,
            y: centerY
        };
    }

    const parentCard = document.querySelector(`[data-id="${parentId}"]`);

    if (!parentCard) return null;

    const parentPos = getCanvasPosition(parentCard);

    return {
        x: parentPos.x + parentCard.offsetWidth / 2,
        y: parentPos.y + parentCard.offsetHeight
    };
}

/* =========================================================
   BRANCH LAYOUT
========================================================= */

function getPositionInsideBranch(element, branch) {
    let x = parseInt(element.style.left) || 0;

    let parent = element.parentElement;

    while (parent && parent !== branch) {
        x += parseInt(parent.style.left) || 0;
        parent = parent.parentElement;
    }

    return x;
}

function layoutBranches() {

    const branches = document.querySelectorAll(".branch-container");

    let currentLeft = 50;
    const gap = 0;

    branches.forEach(branch => {

        const padding = parseInt(branch.dataset.padding) || 120;
        const cards = Array.from(branch.querySelectorAll("[data-id]"));

        let maxRight = 0;

        cards.forEach(card => {
            const cardLeft = getPositionInsideBranch(card, branch);
            const cardRight = cardLeft + card.offsetWidth;

            if (cardRight > maxRight) {
                maxRight = cardRight;
            }
        });

        const measuredWidth = branch.offsetWidth || 0;

        const finalWidth = Math.max(
            maxRight + padding,
            measuredWidth
        );

        branch.style.left = `${currentLeft}px`;
        branch.style.width = `${finalWidth}px`;

        currentLeft += finalWidth + gap;
    });
}

    /* Size Main Branches */

function sizeMainBranches() {
    const branches = document.querySelectorAll(".branch-container");

    branches.forEach(branch => {
        const padding = parseInt(branch.dataset.padding) || 120;

        const bounds = getLocalBounds(branch);

        const width =
            Math.max(0, bounds.maxX - bounds.minX) +
            padding * 2;

        const height =
            Math.max(0, bounds.maxY - bounds.minY) +
            padding;

        if (bounds.minX < padding) {
            const shift = padding - bounds.minX;

            Array.from(branch.children).forEach(child => {
                const left = parseInt(child.style.left) || 0;
                child.style.left = `${left + shift}px`;
            });
        }

        branch.style.width = `${width}px`;
        branch.style.height = `${height}px`;
    });
}

/* =========================================================
   SUB-BRANCH LAYOUT
========================================================= */

function getLocalBounds(container) {
    const items = Array.from(container.querySelectorAll("[data-id], .sub-branch-container"))
        .filter(item => item !== container);

    if (items.length === 0) {
        return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    }

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    items.forEach(item => {
        let x = parseInt(item.style.left) || 0;
        let y = parseInt(item.style.top) || 0;

        let parent = item.parentElement;

        while (parent && parent !== container) {
            x += parseInt(parent.style.left) || 0;
            y += parseInt(parent.style.top) || 0;
            parent = parent.parentElement;
        }

        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x + item.offsetWidth);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y + item.offsetHeight);
    });

    return { minX, maxX, minY, maxY };
}

function sizeSubBranches() {
    const branches = document.querySelectorAll(".sub-branch-container");

    branches.forEach(branch => {
        const padding = parseInt(branch.dataset.padding) || 100;
        const bounds = getLocalBounds(branch);

        const width = Math.max(0, bounds.maxX - bounds.minX) + padding * 2;
        const height = Math.max(0, bounds.maxY - bounds.minY) + padding;

        if (bounds.minX < padding) {
            const shift = padding - bounds.minX;

            Array.from(branch.children).forEach(child => {
                const childLeft = parseInt(child.style.left) || 0;
                child.style.left = `${childLeft + shift}px`;
            });
        }

        branch.style.width = `${width}px`;
        branch.style.height = `${height}px`;
    });
}

function layoutSubBranches() {
    const parents = document.querySelectorAll('[data-auto="children"]');

    parents.forEach(parent => {
        const parentId = parent.dataset.id;

        const branches = Array.from(
            document.querySelectorAll(
                `.sub-branch-container[data-parent="${parentId}"]`
            )
        );

        if (branches.length === 0) return;

        const parentContainer = parent.closest(".sub-branch-container, .branch-container");
        const containerPos = getCanvasPosition(parentContainer);
        const parentAnchor = getRelationshipAnchor(parentId);

        if (!parentAnchor) return;

        const gap = parseInt(parent.dataset.branchGap) || 80;

        const branchData = branches.map(branch => {
            const representative = branch.querySelector(
                `[data-line-parent="${parentId}"]`
            );

            const target = representative || branch.firstElementChild;

            const bounds = getLocalBounds(branch);

            const targetLeft = parseInt(target.style.left) || 0;
            const targetCenterOffset =
                targetLeft + target.offsetWidth / 2;

            return {
                branch,
                targetCenterOffset,
                leftExtent: targetCenterOffset - bounds.minX,
                rightExtent: bounds.maxX - targetCenterOffset
            };
        });

        branchData[0].center = 0;

        for (let i = 1; i < branchData.length; i++) {
            const previous = branchData[i - 1];
            const current = branchData[i];

            current.center =
                previous.center +
                previous.rightExtent +
                gap +
                current.leftExtent;
        }

        const firstCenter = branchData[0].center;
        const lastCenter = branchData[branchData.length - 1].center;
        const groupCenter = (firstCenter + lastCenter) / 2;

        const parentLocalX = parentAnchor.x - containerPos.x;
        const offset = parentLocalX - groupCenter;

        branchData.forEach(item => {
            const branchCenter = offset + item.center;

            item.branch.style.left =
                `${branchCenter - item.targetCenterOffset}px`;
        });
    });
}

/* =========================================================
   PARTNERS LAYOUT
========================================================= */

function hasParentLink(card) {
    return card.dataset.parent || card.dataset.parents || card.dataset.lineParent;
}

function layoutPartners() {
    const cards = document.querySelectorAll("[data-partner]");
    const handled = new Set();

    cards.forEach(card => {
        const cardId = card.dataset.id;
        const partnerId = card.dataset.partner;

        if (handled.has(cardId) || handled.has(partnerId)) return;

        const partner = document.querySelector(`[data-id="${partnerId}"]`);
        if (!partner) return;

        let anchor = card;
        let mover = partner;

        const cardHasParent = hasParentLink(card);
        const partnerHasParent = hasParentLink(partner);

        if (!cardHasParent && partnerHasParent) {
            anchor = partner;
            mover = card;
        }

        const anchorLeft = parseInt(anchor.style.left) || 0;
        const anchorTop = parseInt(anchor.style.top) || 0;
        const gap = parseInt(anchor.dataset.partnerGap) || 40;

        const side = mover.dataset.partnerSide ||
             anchor.dataset.partnerSide ||
             "right";

        if (side === "left") {
            mover.style.left =
                `${anchorLeft - mover.offsetWidth - gap}px`;
        } else {
            mover.style.left =
                `${anchorLeft + anchor.offsetWidth + gap}px`;
        }

        mover.style.top = `${anchorTop}px`;

        handled.add(cardId);
        handled.add(partnerId);
    });
}

/* =========================================================
   CHILDREN LAYOUT
========================================================= */

function getChildCardsFor(card) {
    const cardId = card.dataset.id;

    return Array.from(
        document.querySelectorAll("[data-parent], [data-parents]")
    ).filter(child => {
        if (child.classList.contains("sub-branch-container")) return false;

        if (child.dataset.parent === cardId) return true;

        if (child.dataset.parents) {
            const ids = child.dataset.parents.split(",").map(id => id.trim());
            return ids.includes(cardId);
        }

        return false;
    });
}

function getPartnerExtents(card) {
    const halfCard = card.offsetWidth / 2;

    const result = {
        left: halfCard,
        right: halfCard
    };

    if (!card.dataset.partner) return result;

    const partner = document.querySelector(`[data-id="${card.dataset.partner}"]`);
    if (!partner) return result;

    const gap = parseInt(card.dataset.partnerGap) || 40;

    const side =
        partner.dataset.partnerSide ||
        card.dataset.partnerSide ||
        "right";

    if (side === "left") {
        result.left = halfCard + gap + partner.offsetWidth;
    } else {
        result.right = halfCard + gap + partner.offsetWidth;
    }

    return result;
}

function getPartnerAnchorOffset(card) {
    if (!card.dataset.partner) return 0;

    const partner = document.querySelector(`[data-id="${card.dataset.partner}"]`);
    if (!partner) return 0;

    const parsedGap = parseInt(card.dataset.partnerGap);
    const gap = Number.isNaN(parsedGap) ? 40 : parsedGap;

    const side =
        partner.dataset.partnerSide ||
        card.dataset.partnerSide ||
        "right";

    const cardHalf = card.offsetWidth / 2;
    const partnerHalf = partner.offsetWidth / 2;

    const partnerCenterDistance = cardHalf + gap + partnerHalf;

    if (side === "left") {
        return -partnerCenterDistance / 2;
    }

    return partnerCenterDistance / 2;
}

function getSubtreeExtents(card) {
    const own = getPartnerExtents(card);

    let leftExtent = own.left;
    let rightExtent = own.right;

    const children = getChildCardsFor(card);

    if (children.length > 0) {
        const parsedGap = parseInt(card.dataset.childGap);
        const gap = Number.isNaN(parsedGap) ? 40 : parsedGap;

        const childData = children.map(child => {
            const extents = getSubtreeExtents(child);

            return {
                leftExtent: extents.left,
                rightExtent: extents.right,
                center: 0
            };
        });

        for (let i = 1; i < childData.length; i++) {
            const previous = childData[i - 1];
            const current = childData[i];

            current.center =
                previous.center +
                previous.rightExtent +
                gap +
                current.leftExtent;
        }

        const firstCenter = childData[0].center;
        const lastCenter = childData[childData.length - 1].center;

        const childGroupCenter = (firstCenter + lastCenter) / 2;

        const anchorOffset = getPartnerAnchorOffset(card);

        const minX = Math.min(
            ...childData.map(item =>
                anchorOffset + item.center - childGroupCenter - item.leftExtent
            )
        );

        const maxX = Math.max(
            ...childData.map(item =>
                anchorOffset + item.center - childGroupCenter + item.rightExtent
            )
        );

        leftExtent = Math.max(leftExtent, -minX);
        rightExtent = Math.max(rightExtent, maxX);
    }

    return {
        left: leftExtent,
        right: rightExtent,
        width: leftExtent + rightExtent
    };
}

function getParentAnchor(parent) {
    const parentId = parent.dataset.id;

    if (parent.dataset.partner) {
        const partner = document.querySelector(`[data-id="${parent.dataset.partner}"]`);

        if (partner) {
            const parentPos = getCanvasPosition(parent);

            const parsedGap = parseInt(parent.dataset.partnerGap);
            const gap = Number.isNaN(parsedGap) ? 40 : parsedGap;

            const side =
                partner.dataset.partnerSide ||
                parent.dataset.partnerSide ||
                "right";

            let partnerCenterX;

            if (side === "left") {
                partnerCenterX =
                    parentPos.x -
                    gap -
                    partner.offsetWidth / 2;
            } else {
                partnerCenterX =
                    parentPos.x +
                    parent.offsetWidth +
                    gap +
                    partner.offsetWidth / 2;
            }

            const parentCenterX =
                parentPos.x + parent.offsetWidth / 2;

            return {
                x: (parentCenterX + partnerCenterX) / 2,
                y: parentPos.y + parent.offsetHeight
            };
        }
    }

    return getRelationshipAnchor(parentId);
}

function layoutChildren() {
    const parents = document.querySelectorAll('[data-auto="children"]');

    parents.forEach(parent => {
        const allChildren = getChildCardsFor(parent);

        if (allChildren.length === 0) return;

        const parentContainer = parent.closest(".sub-branch-container, .branch-container");
        const containerPos = getCanvasPosition(parentContainer);

        const parentAnchor = getParentAnchor(parent);

        if (!parentAnchor) return;

        const parsedGap = parseInt(parent.dataset.childGap);
        const gap = Number.isNaN(parsedGap) ? 40 : parsedGap;

        const childData = allChildren.map(child => {
            const extents = getSubtreeExtents(child);

            return {
                child,
                leftExtent: extents.left,
                rightExtent: extents.right,
                center: 0
            };
        });

        for (let i = 1; i < childData.length; i++) {
            const previous = childData[i - 1];
            const current = childData[i];

            current.center =
                previous.center +
                previous.rightExtent +
                gap +
                current.leftExtent;
        }

        const firstCenter = childData[0].center;
        const lastCenter = childData[childData.length - 1].center;

        const groupCenter = (firstCenter + lastCenter) / 2;

        const parentLocalX = parentAnchor.x - containerPos.x;
        const offset = parentLocalX - groupCenter;

        childData.forEach(item => {
            const existingTop = parseInt(item.child.style.top) || 160;
            const childCenter = offset + item.center;

            item.child.style.left =
                `${childCenter - item.child.offsetWidth / 2}px`;

            item.child.style.top = `${existingTop}px`;
        });
    });
}

/* =========================================================
   DRAW TREE LINES
========================================================= */

function drawMarriageLines() {
    lines.innerHTML = "";

    /* Marcus connection point */

    const marcusCard = document.querySelector('[data-id="marcus"]');
    if (!marcusCard) return;

    const marcusPos = getCanvasPosition(marcusCard);

    const wifeCards = Array.from(document.querySelectorAll('[data-connect="wife"]'));

    let spouseLineY = marcusPos.y + (marcusCard.offsetHeight / 2);

    if (wifeCards.length > 0) {
        const firstWife = wifeCards[0];
        const firstWifePos = getCanvasPosition(firstWife);

        spouseLineY = firstWifePos.y + firstWife.offsetHeight / 2;
    }

    const marcusPoint = {
        x: marcusPos.x + marcusCard.offsetWidth,
        y: spouseLineY
    };

    /* Dynamic canvas size */

    const padding = 1000;
    const allCards = Array.from(document.querySelectorAll("[data-id]"));

    const cardRightEdges = allCards.map(card => {
        const pos = getCanvasPosition(card);
        return pos.x + card.offsetWidth;
    });

    const cardBottomEdges = allCards.map(card => {
        const pos = getCanvasPosition(card);
        return pos.y + card.offsetHeight;
    });

    const maxX = Math.max(...cardRightEdges, 2000, marcusPoint.x) + padding;
    const maxY = Math.max(...cardBottomEdges, 1200, marcusPoint.y) + padding;

    canvas.style.width = `${maxX}px`;
    canvas.style.height = `${maxY}px`;

    lines.style.width = `${maxX}px`;
    lines.style.height = `${maxY}px`;

    const svgOffsetX = 0;
    const svgOffsetY = 0;

    /* Main spouse trunk line */

    if (wifeCards.length > 0) {
        const lastCard = wifeCards[wifeCards.length - 1];
        const lastPos = getCanvasPosition(lastCard);

        const lastX = lastPos.x;

        lines.prepend(makeLine(
            marcusPoint.x + svgOffsetX,
            marcusPoint.y + svgOffsetY,
            lastX + svgOffsetX,
            marcusPoint.y + svgOffsetY
        ));
    }

/* Partner lines */

const drawnPartners = new Set();

const partnerCards = Array.from(document.querySelectorAll("[data-partner]"));

partnerCards.forEach(person => {

    const partnerId = person.dataset.partner;
    const pairKey = [person.dataset.id, partnerId].sort().join("-");

    if (drawnPartners.has(pairKey)) return;

    drawnPartners.add(pairKey);

    const partner = document.querySelector(`[data-id="${partnerId}"]`);

    if (!partner) return;

    const personPos = getCanvasPosition(person);
    const partnerPos = getCanvasPosition(partner);

    const personRightX = personPos.x + person.offsetWidth;
    const personCenterY = personPos.y + person.offsetHeight / 2;

    const partnerLeftX = partnerPos.x;
    const partnerCenterY = partnerPos.y + partner.offsetHeight / 2;

    lines.appendChild(makeLine(
        personRightX,
        personCenterY,
        partnerLeftX,
        partnerCenterY
    ));
});

    /* Group children by parent / parent couple */

    const childCards = Array.from(
    document.querySelectorAll("[data-parent], [data-parents], [data-line-parent]")
    ).filter(child => !child.classList.contains("sub-branch-container"));

    const childrenByParent = {};

    childCards.forEach(child => {
    let parentId;

    if (child.dataset.lineParent) {
    parentId = child.dataset.lineParent;
    } else if (child.dataset.parents) {
    parentId = child.dataset.parents;
    } else {
    parentId = child.dataset.parent;
    }

    if (!childrenByParent[parentId]) {
        childrenByParent[parentId] = [];
    }

    childrenByParent[parentId].push(child);
});

    /* Parent-child branch lines */

    Object.keys(childrenByParent).forEach(parentId => {
        const children = childrenByParent[parentId];

        if (children.length === 0) return;

        const anchor = getRelationshipAnchor(parentId);

        if (!anchor) return;

        const parentBottomX = anchor.x;
        const parentBottomY = anchor.y;

        const childPoints = children.map(child => {
            const childPos = getCanvasPosition(child);

            return {
                x: childPos.x + child.offsetWidth / 2,
                y: childPos.y
            };
        });

        /* Single child: direct line */

        if (children.length === 1) {
            const child = childPoints[0];

            lines.appendChild(makeLine(
                parentBottomX + svgOffsetX,
                parentBottomY + svgOffsetY,
                child.x + svgOffsetX,
                child.y + svgOffsetY
            ));

            return;
        }

        /* Multiple children: branching connector */

        const branchY = parentBottomY + 140;

        const leftX = Math.min(...childPoints.map(point => point.x));
        const rightX = Math.max(...childPoints.map(point => point.x));

        lines.appendChild(makeLine(
            parentBottomX + svgOffsetX,
            parentBottomY + svgOffsetY,
            parentBottomX + svgOffsetX,
            branchY + svgOffsetY
        ));

        lines.appendChild(makeLine(
            leftX + svgOffsetX,
            branchY + svgOffsetY,
            rightX + svgOffsetX,
            branchY + svgOffsetY
        ));

        childPoints.forEach(point => {
            lines.appendChild(makeLine(
                point.x + svgOffsetX,
                branchY + svgOffsetY,
                point.x + svgOffsetX,
                point.y + svgOffsetY
            ));
        });
    });
}

/* =========================================================
   INITIAL DRAW
========================================================= */

layoutBranches();

layoutChildren();
layoutPartners();

sizeSubBranches();
layoutSubBranches();

layoutChildren();
layoutPartners();

sizeSubBranches();
layoutSubBranches();

sizeMainBranches();

layoutBranches();

addTreeImages();

drawMarriageLines();

/* =========================================================
   CARD IMAGES
========================================================= */

function addTreeImages() {
    const cards = document.querySelectorAll("[data-image]");

    cards.forEach(card => {
        const img = document.createElement("img");

        img.className = "tree-card-img";
        img.src = card.dataset.image;

        card.prepend(img);
    });
}

/* =========================================================
   DRAG / PAN / ZOOM CANVAS
========================================================= */

let isDragging = false;

let startX;
let startY;

let currentX = 0;
let currentY = 0;
let currentScale = 1;

function updateCanvasTransform() {
    canvas.style.transformOrigin = "0 0";
    canvas.style.transform =
        `translate(${currentX}px, ${currentY}px) scale(${currentScale})`;
}

viewport.addEventListener("mousedown", (e) => {
    isDragging = true;

    startX = e.clientX;
    startY = e.clientY;

    viewport.style.cursor = "grabbing";
});

document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    canvas.style.transform =
        `translate(${currentX + dx}px, ${currentY + dy}px) scale(${currentScale})`;
});

document.addEventListener("mouseup", (e) => {
    if (!isDragging) return;

    currentX += e.clientX - startX;
    currentY += e.clientY - startY;

    updateCanvasTransform();

    isDragging = false;

    viewport.style.cursor = "grab";
});

viewport.addEventListener("wheel", (e) => {
    e.preventDefault();

    const zoomSpeed = 0.1;

    const oldScale = currentScale;

    if (e.deltaY < 0) {
        currentScale += zoomSpeed;
    } else {
        currentScale -= zoomSpeed;
    }

    currentScale = Math.max(
        0.3,
        Math.min(3, currentScale)
    );

    const rect = viewport.getBoundingClientRect();

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const scaleRatio = currentScale / oldScale;

    currentX = mouseX - (mouseX - currentX) * scaleRatio;
    currentY = mouseY - (mouseY - currentY) * scaleRatio;

    updateCanvasTransform();

}, { passive: false });

const octavia = document.querySelector('[data-id="octavia"]');

if (octavia) {
    const viewportRect = viewport.getBoundingClientRect();
    const octaviaPos = getCanvasPosition(octavia);

    currentX =
        viewportRect.width / 2 -
        (octaviaPos.x + octavia.offsetWidth / 2);

    currentY =
        viewportRect.height / 2 -
        (octaviaPos.y + octavia.offsetHeight / 2);

    updateCanvasTransform();
}

drawMarriageLines();
