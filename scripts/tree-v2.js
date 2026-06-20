/* =========================================================
   REGISTRY-DRIVEN FAMILY GRAPH RENDERER
   Replaces the hand-positioned tree markup.
========================================================= */

const TREE_CONFIG = {
    cardWidth: 286,
    cardHeight: 238,
    coupleGap: 36,
    siblingGap: 72,
    generationGap: 145,
    wifeTreeGap: 260,
    topPadding: 220,
    leftPadding: 260,
    bottomPadding: 280,
    rightPadding: 360,
    lineColor: "#b8a27a",
    lineWidth: 3,
    lineOverlap: 20,
    minScale: 0.25,
    maxScale: 2.5,
    zoomSpeed: 0.12
};

/*
   These are visual graph roots, not biographical data.
   The people data still lives in family-registry.js.
*/
const TREE_STRUCTURE = {
    marcus: "marcus",
    wives: ["fulvia", "octavia", "cleopatra"],
    descendants: {
        fulvia: ["iullus"],
        octavia: ["airiana", "antonia"],
        cleopatra: ["helios", "selene"]
    },
    octaviaAncestors: ["caesar", "julia", "julius", "atia", "octavius", "octavian"]
};

let treeViewport;
let treeCanvas;
let treeGraph;
let treeLines;

let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let currentX = 0;
let currentY = 0;
let currentScale = 1;

const renderedNodes = new Map();
const renderedLines = [];

/* =========================================================
   BASIC DATA HELPERS
========================================================= */

function getMember(id) {
    return FAMILY_REGISTRY.members?.[id] || null;
}

function getMemberName(id) {
    return getMember(id)?.name || formatTreeName(id);
}

function getMemberPortrait(id) {
    return getMember(id)?.portrait || "images/background/emblem.png";
}

function getSpouses(id) {
    const member = getMember(id);
    return Array.isArray(member?.spouses) ? member.spouses.filter(Boolean) : [];
}

function getChildren(id) {
    const member = getMember(id);
    return Array.isArray(member?.children) ? member.children.filter(Boolean) : [];
}

function uniqueIds(ids) {
    return Array.from(new Set(ids.filter(Boolean)));
}

function getUnitInputAnchorX(unit) {
    if (!unit) return 0;

    if (typeof unit.inputAnchorX === "number") {
        return unit.inputAnchorX;
    }

    if (typeof unit.anchorX === "number") {
        return unit.anchorX;
    }

    return TREE_CONFIG.cardWidth / 2;
}

function getPrimaryIndexInUnit(unit) {
    if (!unit?.spouseId) return 0;
    return shouldShowSpouseOnLeft(unit.primaryId, unit.spouseId) ? 1 : 0;
}

function setUnitInputAnchor(unit) {
    const primaryIndex = getPrimaryIndexInUnit(unit);
    const memberLeft = unit.anchorX - unit.memberGroupWidth / 2;

    unit.inputAnchorX = memberLeft +
        primaryIndex * (TREE_CONFIG.cardWidth + TREE_CONFIG.coupleGap) +
        TREE_CONFIG.cardWidth / 2;
}

function measureChildRow(childUnits) {
    const childOffsets = [];
    const childAnchorPositions = [];

    if (!childUnits || childUnits.length === 0) {
        return {
            width: 0,
            anchorX: 0,
            childOffsets: []
        };
    }

    childUnits.forEach((child, index) => {
        if (index === 0) {
            const childInputAnchor = getUnitInputAnchorX(child);
            childAnchorPositions.push(childInputAnchor);
            childOffsets.push(0);
            return;
        }

        const previousChild = childUnits[index - 1];
        const previousAnchorX = childAnchorPositions[index - 1];

        const previousRightExtent = previousChild.width - getUnitInputAnchorX(previousChild);
        const nextLeftExtent = getUnitInputAnchorX(child);

        const nextAnchorX = previousAnchorX +
            previousRightExtent +
            TREE_CONFIG.siblingGap +
            nextLeftExtent;

        childAnchorPositions.push(nextAnchorX);
        childOffsets.push(nextAnchorX - getUnitInputAnchorX(child));
    });

    const firstChild = childUnits[0];
    const lastChild = childUnits[childUnits.length - 1];
    const firstAnchorX = childAnchorPositions[0];
    const lastAnchorX = childAnchorPositions[childAnchorPositions.length - 1];

    const leftEdge = firstAnchorX - getUnitInputAnchorX(firstChild);
    const rightEdge = lastAnchorX + (lastChild.width - getUnitInputAnchorX(lastChild));

    return {
        width: rightEdge - leftEdge,
        anchorX: firstAnchorX + (lastAnchorX - firstAnchorX) / 2,
        childOffsets
    };
}

function getFamilyChildren(primaryId, spouseId = null) {
    const children = [...getChildren(primaryId)];

    if (spouseId) {
        children.push(...getChildren(spouseId));
    }

    return uniqueIds(children).filter(id => id !== primaryId && id !== spouseId);
}

function getPrimarySpouse(id) {
    const spouses = getSpouses(id).filter(spouseId => getMember(spouseId));
    return spouses.length > 0 ? spouses[0] : null;
}

function shouldShowSpouseOnLeft(primaryId, spouseId) {
    const primary = getMember(primaryId);
    const spouse = getMember(spouseId);

    /*
       Optional per-couple visual override.

       Add this to either person's registry entry:

       spouseSides: {
           spouseId: "left"
       }

       or:

       spouseSides: {
           spouseId: "right"
       }
    */

    const primaryOverride = primary?.spouseSides?.[spouseId];
    const spouseOverride = spouse?.spouseSides?.[primaryId];

    if (primaryOverride === "left") return true;
    if (primaryOverride === "right") return false;

    /*
       If the override is written from the spouse's entry,
       the meaning is reversed relative to the primary person.
    */

    if (spouseOverride === "left") return false;
    if (spouseOverride === "right") return true;

    /*
       Default old behavior.
    */

    const visualSpouses = FAMILY_REGISTRY.spouses || [];
    return visualSpouses.includes(spouseId) && !visualSpouses.includes(primaryId);
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

/* =========================================================
   LAYOUT MODEL
========================================================= */

function buildPersonUnit(primaryId, visited = new Set()) {
    if (!getMember(primaryId)) return null;

    if (visited.has(primaryId)) {
        return {
            type: "personUnit",
            primaryId,
            spouseId: null,
            people: [primaryId],
            childUnits: [],
            width: TREE_CONFIG.cardWidth,
            height: TREE_CONFIG.cardHeight,
            anchorX: TREE_CONFIG.cardWidth / 2,
            inputAnchorX: TREE_CONFIG.cardWidth / 2,
            cycle: true
        };
    }

    const nextVisited = new Set(visited);
    nextVisited.add(primaryId);

    const spouseId = getPrimarySpouse(primaryId);
    const people = spouseId ? [primaryId, spouseId] : [primaryId];

    if (spouseId) nextVisited.add(spouseId);

    const childIds = getFamilyChildren(primaryId, spouseId)
        .filter(childId => !people.includes(childId));

    const childUnits = childIds
        .map(childId => buildPersonUnit(childId, nextVisited))
        .filter(Boolean);

    const unit = {
        type: "personUnit",
        primaryId,
        spouseId,
        people,
        childUnits,
        width: 0,
        height: 0,
        memberGroupWidth: 0,
        inputAnchorX: 0
    };

    measurePersonUnit(unit);

    return unit;
}

function measurePersonUnit(unit) {
    const cardCount = unit.people.length;

    unit.memberGroupWidth =
        (cardCount * TREE_CONFIG.cardWidth) +
        Math.max(0, cardCount - 1) * TREE_CONFIG.coupleGap;

    if (unit.childUnits.length === 0) {
        unit.width = unit.memberGroupWidth;
        unit.height = TREE_CONFIG.cardHeight;
        unit.anchorX = unit.width / 2;
        setUnitInputAnchor(unit);
        unit.childOffsets = [];
        return unit;
    }

    const childRow = measureChildRow(unit.childUnits);
    const childrenWidth = childRow.width;
    const childrenHeight = Math.max(...unit.childUnits.map(child => child.height));

    const desiredAnchorX = childRow.anchorX;
    const memberLeft = desiredAnchorX - unit.memberGroupWidth / 2;
    const memberRight = desiredAnchorX + unit.memberGroupWidth / 2;

    const subtreeLeft = Math.min(0, memberLeft);
    const subtreeRight = Math.max(childrenWidth, memberRight);

    unit.width = subtreeRight - subtreeLeft;

    const leftPadding = -subtreeLeft;
    unit.height = TREE_CONFIG.cardHeight + TREE_CONFIG.generationGap + childrenHeight;
    unit.anchorX = desiredAnchorX + leftPadding;
    setUnitInputAnchor(unit);
    unit.childOffsets = childRow.childOffsets.map(offset => offset + leftPadding);

    return unit;
}

function buildWifeTree(wifeId) {
    const childRoots = TREE_STRUCTURE.descendants[wifeId] || [];
    const childUnits = childRoots
        .map(childId => buildPersonUnit(childId, new Set([wifeId, TREE_STRUCTURE.marcus])))
        .filter(Boolean);

    const rootWidth = TREE_CONFIG.cardWidth;
    let childOffsets = [];
    let descendantsWidth = 0;
    let descendantsHeight = 0;
    let anchorX = rootWidth / 2;
    let width = rootWidth;

    if (childUnits.length > 0) {
        const childRow = measureChildRow(childUnits);

        childOffsets = childRow.childOffsets;
        descendantsWidth = childRow.width;
        descendantsHeight = Math.max(...childUnits.map(unit => unit.height));

        const desiredAnchorX = childRow.anchorX;

        const rootLeft = desiredAnchorX - rootWidth / 2;
        const rootRight = desiredAnchorX + rootWidth / 2;
        const leftPadding = Math.max(0, -rootLeft);
        const rightPadding = Math.max(0, rootRight - descendantsWidth);

        width = descendantsWidth + leftPadding + rightPadding;
        anchorX = desiredAnchorX + leftPadding;
        childOffsets = childOffsets.map(offset => offset + leftPadding);
    }

    const baseHeight = TREE_CONFIG.cardHeight +
        (childUnits.length > 0 ? TREE_CONFIG.generationGap + descendantsHeight : 0);

    const tree = {
        type: "wifeTree",
        wifeId,
        childUnits,
        childOffsets,
        anchorX,
        width,
        height: baseHeight,
        ancestorHeight: 0
    };

    if (wifeId === "octavia") {
        tree.ancestorHeight = TREE_CONFIG.cardHeight * 3 + TREE_CONFIG.generationGap * 3;

        const ancestorWidth = TREE_CONFIG.cardWidth * 2 + TREE_CONFIG.siblingGap;
        const ancestorLeft = tree.anchorX - ancestorWidth / 2;
        const ancestorRight = tree.anchorX + ancestorWidth / 2;
        const leftPadding = Math.max(0, -ancestorLeft);
        const rightPadding = Math.max(0, ancestorRight - tree.width);

        tree.width += leftPadding + rightPadding;
        tree.anchorX += leftPadding;
        tree.childOffsets = tree.childOffsets.map(offset => offset + leftPadding);
        tree.height += tree.ancestorHeight + TREE_CONFIG.generationGap;
    }

    return tree;
}

function getUnitsWidth(units, gap) {
    if (!units || units.length === 0) return 0;

    return units.reduce((total, unit) => total + unit.width, 0) +
        Math.max(0, units.length - 1) * gap;
}

/* =========================================================
   POSITIONING
========================================================= */

function layoutWifeTree(tree, x, y, wifeYOverride = null) {
    const wifeY = wifeYOverride ?? y + tree.ancestorHeight;
    const wifeX = x + tree.anchorX - TREE_CONFIG.cardWidth / 2;

    placeCard(tree.wifeId, wifeX, wifeY, "tree-wife-card");

    if (tree.wifeId === "octavia") {
        layoutOctaviaAncestors(tree, x, y, wifeX, wifeY);
    }

    if (tree.childUnits.length === 0) return;

    const childY = wifeY + TREE_CONFIG.cardHeight + TREE_CONFIG.generationGap;

    tree.childUnits.forEach((childUnit, index) => {
        layoutPersonUnit(childUnit, x + tree.childOffsets[index], childY);
    });

    addParentChildLines(tree.wifeId, null, tree.childUnits);
}

function layoutOctaviaAncestors(tree, treeX, treeY, octaviaX, octaviaY) {
    /*
       This ancestor block is deliberately custom.

       The intended visual path is:

                    Caesar
                      |
                +-----+-----+
                |            |
              Julia        Julius
                |
              Atia -+- Octavius
                    |
              +-----+-----+
              |           |
           Octavia     Octavian

       Julia is the direct parent line. Julius is Julia's brother.
       Atia sits centered above Octavia and Octavian.
       Octavia is deliberately lower than Octavian because she anchors
       the main descendant tree.
    */

    const octavianX =
        octaviaX +
        TREE_CONFIG.cardWidth +
        TREE_CONFIG.siblingGap;

    const octaviaCenterX =
        octaviaX + TREE_CONFIG.cardWidth / 2;

    const octavianCenterX =
        octavianX + TREE_CONFIG.cardWidth / 2;

    const childGroupCenterX =
        (octaviaCenterX + octavianCenterX) / 2;

    const octaviusOnLeft =
        shouldShowSpouseOnLeft("atia", "octavius");

    const atiaX = octaviusOnLeft
        ? Math.round(childGroupCenterX + TREE_CONFIG.coupleGap / 2)
        : Math.round(childGroupCenterX - TREE_CONFIG.cardWidth - TREE_CONFIG.coupleGap / 2);

    const octaviusX = octaviusOnLeft
        ? atiaX - TREE_CONFIG.cardWidth - TREE_CONFIG.coupleGap
        : atiaX + TREE_CONFIG.cardWidth + TREE_CONFIG.coupleGap;

    const octavianY =
        octaviaY -
        Math.round(TREE_CONFIG.cardHeight * 1.4);

    const atiaY =
        octavianY -
        TREE_CONFIG.cardHeight -
        Math.round(TREE_CONFIG.generationGap * 1.1);

    const octaviusY = atiaY;

    const juliaX = atiaX;

    const juliaY =
        atiaY -
        TREE_CONFIG.cardHeight -
        Math.round(TREE_CONFIG.generationGap * 0.9);

    const juliusX =
        juliaX +
        TREE_CONFIG.cardWidth +
        TREE_CONFIG.coupleGap;

    const juliusY = juliaY;

    const caesarX =
        juliaX +
        (TREE_CONFIG.cardWidth + TREE_CONFIG.coupleGap) / 2;

    const caesarY =
        juliaY -
        TREE_CONFIG.cardHeight -
        Math.round(TREE_CONFIG.generationGap * 1.0);

    placeCard("caesar", caesarX, caesarY, "tree-child-card tree-ancestor-card");
    placeCard("julia", juliaX, juliaY, "tree-child-card tree-ancestor-card");
    placeCard("julius", juliusX, juliusY, "tree-child-card tree-ancestor-card");

    placeCard("atia", atiaX, atiaY, "tree-child-card tree-ancestor-card");
    placeCard("octavius", octaviusX, octaviusY, "tree-child-card tree-ancestor-card");

    placeCard("octavian", octavianX, octavianY, "tree-child-card tree-ancestor-card");

    if (octaviusOnLeft) {
        addSpouseLine("octavius", "atia");
    } else {
        addSpouseLine("atia", "octavius");
    }

    addSiblingLine(["julia", "julius"], "caesar");
    addVerticalLine("julia", "atia");
    addAtiaAncestorLines();
}

function layoutPersonUnit(unit, x, y) {
    const people = [...unit.people];

    if (unit.spouseId && shouldShowSpouseOnLeft(unit.primaryId, unit.spouseId)) {
        people.reverse();
    }

    const groupX = x + unit.anchorX - unit.memberGroupWidth / 2;

    people.forEach((id, index) => {
        const cardX = groupX + index * (TREE_CONFIG.cardWidth + TREE_CONFIG.coupleGap);
        placeCard(id, cardX, y, "tree-child-card");
    });

    if (people.length === 2) {
        addSpouseLine(people[0], people[1]);
    }

    if (unit.childUnits.length === 0) return;

    const childY = y + TREE_CONFIG.cardHeight + TREE_CONFIG.generationGap;

    unit.childUnits.forEach((childUnit, index) => {
        layoutPersonUnit(childUnit, x + unit.childOffsets[index], childY);
    });

    addParentChildLines(people[0], people[1] || null, unit.childUnits);
}

function placeCard(id, x, y, className) {
    const member = getMember(id);

    if (!member) return;

    renderedNodes.set(id, {
        id,
        x,
        y,
        width: TREE_CONFIG.cardWidth,
        height: TREE_CONFIG.cardHeight
    });

    const card = document.createElement("div");
    card.className = `${className} generated-tree-card`;
    card.dataset.id = id;
    card.dataset.image = getMemberPortrait(id);
    card.style.left = `${x}px`;
    card.style.top = `${y}px`;

    card.innerHTML = `
        <img class="tree-card-img" src="${escapeHtml(getMemberPortrait(id))}" alt="${escapeHtml(getMemberName(id))}">
        <span class="tree-card-name">${escapeHtml(getMemberName(id))}</span>
    `;

    card.addEventListener("click", event => {
        const portrait = event.target.closest(".tree-card-img");
        if (!portrait) return;

        event.stopPropagation();
        openTreeModal(card);
    });

    treeGraph.appendChild(card);
}

/* =========================================================
   LINE MODEL
========================================================= */

function getNode(id) {
    return renderedNodes.get(id);
}

function getTopCenter(id) {
    const node = getNode(id);
    return node ? {
        x: node.x + node.width / 2,
        y: node.y + TREE_CONFIG.lineOverlap
    } : null;
}

function getBottomCenter(id) {
    const node = getNode(id);
    return node ? {
        x: node.x + node.width / 2,
        y: node.y + node.height - TREE_CONFIG.lineOverlap
    } : null;
}

function getTopEdgeCenter(id) {
    const node = getNode(id);
    return node ? { x: node.x + node.width / 2, y: node.y } : null;
}

function getBottomEdgeCenter(id) {
    const node = getNode(id);
    return node ? { x: node.x + node.width / 2, y: node.y + node.height } : null;
}

function getLeftCenter(id) {
    const node = getNode(id);
    return node ? { x: node.x, y: node.y + node.height / 2 } : null;
}

function getRightCenter(id) {
    const node = getNode(id);
    return node ? { x: node.x + node.width, y: node.y + node.height / 2 } : null;
}

function getCoupleBottomCenter(primaryId, spouseId) {
    const primary = getNode(primaryId);
    const spouse = spouseId ? getNode(spouseId) : null;

    if (!primary) return null;

    if (!spouse) {
        const bottom = getBottomCenter(primaryId);
        return bottom
            ? {
                ...bottom,
                branchY: bottom.y + TREE_CONFIG.generationGap / 2
            }
            : null;
    }

    const left = Math.min(primary.x, spouse.x);
    const right = Math.max(primary.x + primary.width, spouse.x + spouse.width);
    const bottomY = Math.max(primary.y + primary.height, spouse.y + spouse.height);
    const spouseLineY = Math.min(primary.y, spouse.y) + TREE_CONFIG.cardHeight / 2;

    return {
        x: left + (right - left) / 2,
        y: spouseLineY,
        branchY: bottomY + TREE_CONFIG.generationGap / 2
    };
}

function addSpouseLine(leftId, rightId) {
    const left = getRightCenter(leftId);
    const right = getLeftCenter(rightId);

    if (!left || !right) return;

    renderedLines.push({
        type: "path",
        d: `M ${left.x} ${left.y} L ${right.x} ${right.y}`
    });
}

function addVerticalLine(parentId, childId) {
    const parent = getBottomCenter(parentId);
    const child = getTopCenter(childId);

    if (!parent || !child) return;

    const midY = parent.y + (child.y - parent.y) / 2;

    renderedLines.push({
        type: "path",
        d: `M ${parent.x} ${parent.y} L ${parent.x} ${midY} L ${child.x} ${midY} L ${child.x} ${child.y}`
    });
}

function addSiblingLine(childIds, parentId) {
    const parent = getBottomCenter(parentId);
    const childPoints = childIds.map(getTopCenter).filter(Boolean);

    if (!parent || childPoints.length === 0) return;

    const branchY = parent.y + TREE_CONFIG.generationGap / 2;
    const first = childPoints[0];
    const last = childPoints[childPoints.length - 1];

    renderedLines.push({
        type: "path",
        d: `M ${parent.x} ${parent.y} L ${parent.x} ${branchY} L ${first.x} ${branchY} M ${last.x} ${branchY} L ${parent.x} ${branchY}`
    });

    childPoints.forEach(point => {
        renderedLines.push({
            type: "path",
            d: `M ${point.x} ${branchY} L ${point.x} ${point.y}`
        });
    });
}

function addAtiaAncestorLines() {
    const parent = getCoupleBottomCenter("atia", "octavius");
    const octaviaTop = getTopCenter("octavia");
    const octavianTop = getTopCenter("octavian");

    if (!parent || !octaviaTop || !octavianTop) return;

    const branchY =
        parent.y + (octavianTop.y - parent.y) / 2;

    renderedLines.push({
        type: "path",
        d: `M ${parent.x} ${parent.y} L ${parent.x} ${branchY}`
    });

    renderedLines.push({
        type: "path",
        d: `M ${octaviaTop.x} ${branchY} L ${octavianTop.x} ${branchY}`
    });

    renderedLines.push({
        type: "path",
        d: `M ${octaviaTop.x} ${branchY} L ${octaviaTop.x} ${octaviaTop.y}`
    });

    renderedLines.push({
        type: "path",
        d: `M ${octavianTop.x} ${branchY} L ${octavianTop.x} ${octavianTop.y}`
    });
}

function addParentChildLines(primaryId, spouseId, childUnits) {
    const parent = getCoupleBottomCenter(primaryId, spouseId);

    if (!parent || childUnits.length === 0) return;

    const childTopPoints = childUnits
        .map(unit => getTopCenter(unit.primaryId))
        .filter(Boolean);

    if (childTopPoints.length === 0) return;

    /*
       For single parents, the line starts just inside the bottom of the card.
       For couples, the line starts from the midpoint of the spouse connector line.
       All child lines end just inside the top of the child card so the stroke
       visually tucks under the card instead of stopping short at the border.
    */
    const parentEdge = spouseId ? parent : getBottomEdgeCenter(primaryId);
    const branchY = spouseId
        ? parent.branchY
        : parentEdge.y + TREE_CONFIG.generationGap / 2;

    renderedLines.push({
        type: "path",
        d: `M ${parent.x} ${parent.y} L ${parent.x} ${branchY}`
    });

    if (childTopPoints.length === 1) {
        const child = childTopPoints[0];
        renderedLines.push({
            type: "path",
            d: `M ${parent.x} ${branchY} L ${child.x} ${branchY} L ${child.x} ${child.y}`
        });
        return;
    }

    const first = childTopPoints[0];
    const last = childTopPoints[childTopPoints.length - 1];

    renderedLines.push({
        type: "path",
        d: `M ${first.x} ${branchY} L ${last.x} ${branchY}`
    });

    childTopPoints.forEach(child => {
        renderedLines.push({
            type: "path",
            d: `M ${child.x} ${branchY} L ${child.x} ${child.y}`
        });
    });
}

function getUnitTopCenter(unit) {
    const primary = getNode(unit.primaryId);
    const spouse = unit.spouseId ? getNode(unit.spouseId) : null;

    if (!primary) return null;

    if (!spouse) {
        return {
            x: primary.x + primary.width / 2,
            y: primary.y
        };
    }

    const left = Math.min(primary.x, spouse.x);
    const right = Math.max(primary.x + primary.width, spouse.x + spouse.width);

    return {
        x: left + (right - left) / 2,
        y: Math.min(primary.y, spouse.y)
    };
}

function drawLines() {
    treeLines.innerHTML = "";

    renderedLines.forEach(line => {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", line.d);
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", TREE_CONFIG.lineColor);
        path.setAttribute("stroke-width", TREE_CONFIG.lineWidth);
        path.setAttribute("stroke-linecap", "round");
        path.setAttribute("stroke-linejoin", "round");
        treeLines.appendChild(path);
    });
}

function drawMarcusWifeLine() {
    const wifeIds = TREE_STRUCTURE.wives;
    const marcus = getNode(TREE_STRUCTURE.marcus);
    const wives = wifeIds.map(getNode).filter(Boolean);

    if (!marcus || wives.length === 0) return;

    /*
       Marcus is visually connected to the wives by one horizontal line
       that passes behind the center of each wife card.
       The SVG layer sits behind cards, so the cards remain readable.
    */
    const baselineY = wives[0].y + wives[0].height / 2;
    const startX = marcus.x + marcus.width;
    const endX = wives[wives.length - 1].x + wives[wives.length - 1].width / 2;

    renderedLines.push({
        type: "path",
        d: `M ${startX} ${baselineY} L ${endX} ${baselineY}`
    });
}

/* =========================================================
   RENDER GRAPH
========================================================= */

function renderServusCustosRow() {
    const servusCustosIds =
        FAMILY_REGISTRY.categories?.["Servus / Custo"] || [];

    if (servusCustosIds.length === 0) return;

    const existingNodes = Array.from(renderedNodes.values());

    if (existingNodes.length === 0) return;

    const minX = Math.min(...existingNodes.map(node => node.x));
    const maxX = Math.max(...existingNodes.map(node => node.x + node.width));
    const maxY = Math.max(...existingNodes.map(node => node.y + node.height));

    const rowGap = TREE_CONFIG.generationGap * 1.5;
    const rowY = maxY + rowGap;

    const dividerY = maxY + rowGap / 2;

    const dividerPadding = 5000;
    renderedLines.push({
        type: "path",
        className: "tree-divider-line",
        d: `M ${minX - dividerPadding} ${dividerY} L ${maxX + dividerPadding} ${dividerY}`
    });

    const cardGap = TREE_CONFIG.siblingGap;
    const rowWidth =
        servusCustosIds.length * TREE_CONFIG.cardWidth +
        Math.max(0, servusCustosIds.length - 1) * cardGap;

    const treeCenterX = minX + (maxX - minX) / 2;
    let nextX = treeCenterX - rowWidth / 2;

    servusCustosIds.forEach(id => {
        placeCard(
            id,
            nextX,
            rowY,
            "tree-child-card tree-household-card"
        );

        nextX += TREE_CONFIG.cardWidth + cardGap;
    });
}

function renderTree() {
    renderedNodes.clear();
    renderedLines.length = 0;
    treeGraph.innerHTML = "";
    treeLines.innerHTML = "";

    const wifeTrees = TREE_STRUCTURE.wives.map(buildWifeTree);
    const maxAncestorHeight = Math.max(...wifeTrees.map(tree => tree.ancestorHeight || 0));

    let nextX = TREE_CONFIG.leftPadding + TREE_CONFIG.cardWidth + TREE_CONFIG.wifeTreeGap;
    const baseY = TREE_CONFIG.topPadding;
    const wifeY = baseY + maxAncestorHeight;
    const marcusWifeBaselineY = wifeY + TREE_CONFIG.cardHeight / 2;

    placeCard(
        TREE_STRUCTURE.marcus,
        TREE_CONFIG.leftPadding,
        marcusWifeBaselineY - TREE_CONFIG.cardHeight / 2,
        "tree-marcus-card"
    );

    wifeTrees.forEach(tree => {
        layoutWifeTree(tree, nextX, baseY, wifeY);
        nextX += tree.width + TREE_CONFIG.wifeTreeGap;
    });

    drawMarcusWifeLine();
    renderServusCustosRow();
    drawLines();
    resizeCanvasToGraph();
}

function resizeCanvasToGraph() {
    const nodes = Array.from(renderedNodes.values());

    if (nodes.length === 0) return;

    const maxX = Math.max(...nodes.map(node => node.x + node.width)) + TREE_CONFIG.rightPadding;
    const maxY = Math.max(...nodes.map(node => node.y + node.height)) + TREE_CONFIG.bottomPadding;

    treeCanvas.style.width = `${Math.ceil(maxX)}px`;
    treeCanvas.style.height = `${Math.ceil(maxY)}px`;
    treeLines.setAttribute("width", Math.ceil(maxX));
    treeLines.setAttribute("height", Math.ceil(maxY));
    treeLines.setAttribute("viewBox", `0 0 ${Math.ceil(maxX)} ${Math.ceil(maxY)}`);
}

/* =========================================================
   PAN / ZOOM
========================================================= */

function updateCanvasTransform() {
    treeCanvas.style.transformOrigin = "0 0";
    treeCanvas.style.transform = `translate(${currentX}px, ${currentY}px) scale(${currentScale})`;
}

function setupPanAndZoom() {
    treeViewport.addEventListener("mousedown", event => {
        if (event.button !== 0) return;

        isDragging = true;
        dragStartX = event.clientX;
        dragStartY = event.clientY;
        treeViewport.style.cursor = "grabbing";
    });

    document.addEventListener("mousemove", event => {
        if (!isDragging) return;

        const dx = event.clientX - dragStartX;
        const dy = event.clientY - dragStartY;

        treeCanvas.style.transform = `translate(${currentX + dx}px, ${currentY + dy}px) scale(${currentScale})`;
    });

    document.addEventListener("mouseup", event => {
        if (!isDragging) return;

        currentX += event.clientX - dragStartX;
        currentY += event.clientY - dragStartY;
        isDragging = false;
        treeViewport.style.cursor = "grab";
        updateCanvasTransform();
    });

    treeViewport.addEventListener("wheel", event => {
        event.preventDefault();

        const oldScale = currentScale;
        const direction = event.deltaY < 0 ? 1 : -1;

        currentScale += direction * TREE_CONFIG.zoomSpeed;
        currentScale = Math.max(TREE_CONFIG.minScale, Math.min(TREE_CONFIG.maxScale, currentScale));

        const rect = treeViewport.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        const scaleRatio = currentScale / oldScale;

        currentX = mouseX - (mouseX - currentX) * scaleRatio;
        currentY = mouseY - (mouseY - currentY) * scaleRatio;

        updateCanvasTransform();
    }, { passive: false });
}

function centerOnCard(id) {
    const node = getNode(id);

    if (!node) return;

    const viewportRect = treeViewport.getBoundingClientRect();

    currentX = viewportRect.width / 2 - (node.x + node.width / 2) * currentScale;
    currentY = viewportRect.height / 2 - (node.y + node.height / 2) * currentScale;

    updateCanvasTransform();
}

function centerInitialView() {
    const params = new URLSearchParams(window.location.search);
    const focusId = params.get("focus");

    if (focusId && renderedNodes.has(focusId)) {
        centerOnCard(focusId);
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
    }

    centerOnCard("octavia");
}

/* =========================================================
   MODAL
========================================================= */

function getTreeCharacterData(id) {
    const registryData = FAMILY_REGISTRY.members?.[id] || {};
    const pageData = window[`${id}Page`] || {};

    return {
        ...registryData,
        ...pageData
    };
}

async function getTreeLineage(id) {
    const LINEAGE_ROOT_ID = "octavia";

    const lineage = [];
    let currentId = id;
    const safety = new Set();

    while (currentId && !safety.has(currentId)) {
        safety.add(currentId);

        await loadTreeCharacterScript(currentId);

        const data = getTreeCharacterData(currentId);
        if (!data.name && !data.parent) break;

        lineage.unshift(data.name || formatTreeName(currentId));

        /*
           Octavia is the visual root of her descendants in the journal modal.
           Her own ancestors still exist on the tree, but descendants should not
           display Caesar / Julia / Atia above Octavia in the lineage ribbon.
        */
        if (currentId === LINEAGE_ROOT_ID && id !== LINEAGE_ROOT_ID) {
            break;
        }

        currentId = data.parent || null;
    }

    return lineage.join('<span class="lineage-separator">/</span>');
}

async function openTreeModal(card) {
    const modal = document.getElementById("tree-modal");

    if (!modal) return;

    const id = card.dataset.id;
    const image = card.dataset.image;
    const cardText = card.textContent.trim();

    const modalImg = document.getElementById("tree-modal-img");
    const modalName = document.getElementById("tree-modal-name");
    const modalTitle = document.getElementById("tree-modal-title");
    const modalSummary = document.getElementById("tree-modal-summary");
    const modalJournal = document.getElementById("tree-modal-journal");
    const modalLineage = document.getElementById("tree-modal-lineage");

    modalImg.src = image || "images/background/emblem.png";
    modalName.textContent = cardText || id;
    modalTitle.textContent = "Family Tree Entry";
    modalSummary.innerHTML = "Journal details to come.";
    modalLineage.innerHTML = "";
    modalJournal.href = `journal.html?char=${encodeURIComponent(id)}`;

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");

    await loadTreeCharacterScript(id);

    const data = getTreeCharacterData(id);

    modalImg.src = data.portrait || modalImg.src;
    modalName.textContent = data.name || modalName.textContent;
    modalTitle.textContent = data.title || "";
    modalLineage.innerHTML = await getTreeLineage(id);
    modalSummary.innerHTML = buildTreeModalFacts(data);
}

function loadTreeCharacterScript(id) {
    return new Promise(resolve => {
        const existingScript = document.querySelector(`script[data-tree-character="${id}"]`);

        if (existingScript) {
            resolve();
            return;
        }

        const script = document.createElement("script");
        const folder = getCharacterFolder(id);

        script.src = `pages/${folder}/${id}.js`;
        script.dataset.treeCharacter = id;

        script.onload = () => resolve();
        script.onerror = () => {
            console.warn(`Could not load character file for: ${id}`);
            resolve();
        };

        document.body.appendChild(script);
    });
}

function formatTreeName(id) {
    const member = getMember(id);

    if (member?.name) return member.name;

    return id
        .split("_")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function buildTreePersonLink(id) {
    const name = formatTreeName(id);

    return `
        <button class="tree-modal-person-link" type="button" data-person-id="${escapeHtml(id)}">
            ${escapeHtml(name)}
        </button>
    `;
}

function buildTreeModalFacts(data) {
    const roleParts = [];
    const factParts = [];

    if (data.role) {
        roleParts.push(`
            <p class="tree-modal-role">
                ${data.role}
            </p>
        `);
    }

    if (data.status) {
        factParts.push(`
            <p class="tree-modal-detail">
                <span class="tree-modal-label">Status:</span>
                <span class="tree-modal-value">${data.status}</span>
            </p>
        `);
    }

    if (data.residence) {
        factParts.push(`
            <p class="tree-modal-detail">
                <span class="tree-modal-label">Residence:</span>
                <span class="tree-modal-value">${data.residence}</span>
            </p>
        `);
    }

    if (Array.isArray(data.spouses) && data.spouses.length > 0) {
        factParts.push(`
            <p class="tree-modal-detail">
                <span class="tree-modal-label">Spouse:</span>
                <span class="tree-modal-value"> ${data.spouses.map(buildTreePersonLink).join(", ")}</span>
            </p>
        `);
    }

    if (Array.isArray(data.children) && data.children.length > 0) {
        factParts.push(`
            <div class="tree-modal-detail">
                <div class="tree-modal-label">Children:</div>
                <div class="tree-modal-list">
                    ${data.children
                        .map(child => `
                            <div class="tree-modal-value">
                                ${buildTreePersonLink(child)}
                            </div>
                        `)
                        .join("")}
                </div>
            </div>
        `);
    }

    return `
        ${roleParts.join("")}
        <div class="tree-modal-facts">
            ${factParts.join("")}
        </div>
    `;
}

function closeTreeModal() {
    const modal = document.getElementById("tree-modal");

    if (!modal) return;

    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
}

function setupModalEvents() {
    document.querySelectorAll("[data-close-modal]").forEach(button => {
        button.addEventListener("click", closeTreeModal);
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") closeTreeModal();
    });

    document.addEventListener("click", event => {
        const link = event.target.closest(".tree-modal-person-link");

        if (!link) return;

        event.preventDefault();
        event.stopPropagation();

        const personId = link.dataset.personId;
        const card = document.querySelector(`[data-id="${personId}"]`);

        if (card) {
            openTreeModal(card);
            centerOnCard(personId);
        }
    });
}

/* =========================================================
   INITIALIZE
========================================================= */

function initializeTree() {
    treeViewport = document.getElementById("tree-viewport");
    treeCanvas = document.getElementById("tree-canvas");
    treeGraph = document.getElementById("tree-graph");
    treeLines = document.getElementById("tree-lines");

    if (!treeViewport || !treeCanvas || !treeGraph || !treeLines) {
        console.error("Tree rebuild failed: required tree elements are missing.");
        return;
    }

    renderTree();
    setupPanAndZoom();
    setupModalEvents();
    centerInitialView();
}

document.addEventListener("DOMContentLoaded", initializeTree);
