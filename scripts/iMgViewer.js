// TODO? scroll with touchpad/mousewheel
document.addEventListener('DOMContentLoaded', () => {
    const imgStack = document.getElementById('imageStack');
    const imgs = Array.from(imgStack.querySelectorAll('img'));
    let topIdx = 0;  // The index of the image currently on top

    let isDragging = false;
    let dragStartX = 0;
    let topImgRef = null;  // reference to the image being dragged

    const REVERSE_DRAG_AT = 180;    // where the drag shall be reversed
    const SWIPE_THRESHOLD = 80;     // pixels needed to register a swipe
    const MAX_Z = imgs.length * 5;  // max Z index

    const fullscreenOverlay = document.getElementById('fullscreenOverlay');
    const fullscreenImg = document.getElementById('fullscreenImg');
    let isFullscreen = false;

    // image at `topIdx` is being dragged to the wrong direction
    function badDirDrag(dragDist) {
        const isLeftDrag = dragDist < 0;
        return (!isLeftDrag && topIdx === 0) || (isLeftDrag && topIdx === imgs.length - 1);
    }

    // update the stack of images based on their index
    function updateStackDisplay() {
        imgs.forEach((img, idx) => {
            const diff = idx - topIdx;       // how far it is from the top, which direction
            const absDiff = Math.abs(diff);  // how far it is from the top
            // the further away from the top, the smaller
            const new_scale = 1 - absDiff * 0.06;
            // X axis: the further away from the top, the further to either side
            // rotation: the further away from the top, the more rotated
            img.style.transform = `scale(${new_scale}) translateX(${diff * 6}%) rotateZ(${diff * 2}deg)`;
            img.style.zIndex = MAX_Z - absDiff * 2;  // the further away from top, the lower
        });
    }

    function toggleFullscreen() {
        if (!isFullscreen) {
            fullscreenImg.src = imgs[topIdx].src;
            fullscreenImg.alt = imgs[topIdx].alt;

            fullscreenOverlay.classList.add('active');
            // fullscreenOverlay.style.visibility = 'visible';

            document.body.style.overflow = 'hidden';  // this makes the whole page unscrollable
            // imgStack.style.visibility = 'hidden';
        } else {
            fullscreenOverlay.classList.remove('active');

            document.body.style.overflow = '';  // unset?
            // fullscreenOverlay.style.visibility = 'hidden';
            // imgStack.style.visibility = 'visible';
        }
        isFullscreen = !isFullscreen;  // toggle
    }

    // --- Start Drag Handler ---
    const handleStart = (ev) => {
        if (isFullscreen) return;
        // only start dragging if the top image is being dragged
        if (imgs[topIdx] === ev.target) {
            isDragging = true;
            dragStartX = ev.clientX || ev.touches[0].clientX;
            topImgRef = ev.target;               // reference to the image on top, being dragged
            topImgRef.classList.add('swiping');  // Indicate dragging
            topImgRef.dataset.origTransform =
                topImgRef.style.transform;  // store the original state of transform
            // WARN: this little bastard has to be stored as a string
            topImgRef.dataset.zOk = 'false';  // zIndex is not yet drag-ok

            // desktop: prevent default text selection/image drag
            if (ev.type === 'mousedown') {
                ev.preventDefault();
            }
            // mobile: do NOT prevent default scroll, allow browser to decide intention
        }
    };

    // --- During Drag Handler ---
    const handleDrag = (ev) => {
        if (!isDragging || !topImgRef || (!ev.clientX && !ev.touches) || isFullscreen) return;

        // desktop: cursor position || mobile: touch position
        const cursorX = ev.clientX || ev.touches[0].clientX;
        const draggedX = cursorX - dragStartX;  // pixels dragged already
        if (badDirDrag(draggedX)) return;
        const absDraggedX = Math.abs(draggedX);

        // transform state before transforming
        const origTransform = topImgRef.dataset.origTransform;
        const left = imgs[topIdx - 1];
        const right = imgs[topIdx + 1];
        // dragging right, more than 20px => z indexes have to be rearranged
        if (draggedX > 20 && left && right && left.style.zIndex <= right.style.zIndex) {
            for (let i = topIdx + 1; i < imgs.length; i++) {
                const newZ = right.style.zIndex - i;
                imgs[i].style.zIndex = newZ;
            }
        } else if (draggedX < -20 && left && right && left.style.zIndex > right.style.zIndex) {
            // this is just the opposite of the branch above to undo that :)
            for (let i = topIdx + 1; i < imgs.length; i++) {
                imgs[i].style.zIndex++;
            }
        }

        const newScale = 1 - absDraggedX * 0.001;
        let newX = draggedX;

        if (absDraggedX > REVERSE_DRAG_AT) {
            const revDraggedX = absDraggedX - REVERSE_DRAG_AT;
            newX = revDraggedX - REVERSE_DRAG_AT;
            const isLeft = draggedX > 0;
            if (isLeft) {
                newX *= -1;
            }
            if (revDraggedX > REVERSE_DRAG_AT / 1.4) {
                return;
            }
            if (topImgRef.dataset.zOk === 'false') {
                if (isLeft) {
                    topImgRef.style.zIndex = left.style.zIndex - 1;
                } else {
                    topImgRef.style.zIndex = right.style.zIndex;
                }
                topImgRef.dataset.zOk = 'true';  // mark as resolved
            }
        } else if (topImgRef.dataset.zOk !== 'false') {
            console.warn('handling this edge case cost me several hours, shame on you!');
            topImgRef.style.zIndex = MAX_Z;
            topImgRef.dataset.zOk = 'false';  // mark as unresolved
        }

        // transform active image to make it move with the finger/mouse
        topImgRef.style.transform =
            `${origTransform} scale(${newScale}) translateX(${newX}px) rotateZ(${newX / 18}deg)`;

        // mobile: prevent default scroll *after* we've applied our transform
        if (ev.type === 'touchmove') {
            ev.preventDefault();
        }
    };

    // --- End Drag Handler ---
    const handleEnd = (ev) => {
        if (!isDragging || !topImgRef || (!ev.clientX && !ev.touches)) return;

        const endX = ev.clientX || ev.changedTouches[0].clientX;  // ended drag at
        const dragDist = endX - dragStartX;
        const badDir = badDirDrag(dragDist);

        // only approve a drag if it exceeds the threshold
        if (Math.abs(dragDist) >= SWIPE_THRESHOLD && !badDir) {
            if (dragDist < 0) {
                // Swiped left (next image)
                topIdx = Math.min(imgs.length - 1, topIdx + 1);  // clamp not to overflow
            } else {
                // Swiped right (previous image)
                topIdx = Math.max(0, topIdx - 1);  // clamp not to underflow
            }
        }
        // else (not enough swipe), current index remains the same, image snaps back via CSS after cleanup

        // Clean up
        topImgRef.classList.remove('swiping');
        topImgRef.style.transform =
            topImgRef.dataset.origTransform;  // Ensure it snaps back or moves to new position smoothly
        topImgRef.dataset.zOk = 'false';

        topImgRef = null;    // clear reference
        isDragging = false;  // reset drag state

        if (Math.abs(dragDist) < 3) {
            ev.preventDefault();  // matters on mobile for some reason
            // we interpret it as a click
            toggleFullscreen();
        } else {
            // update display for the new current index or just snap back
            updateStackDisplay();
        }
    };

    // --- Event Listeners ---

    // desktop: mouse listeners:
    // mouse down on `imgStack`: start dragging
    imgStack.addEventListener('mousedown', handleStart);
    // mouse move/up on `document` to capture drag/up even if pointer leaves `imgStack`
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', handleEnd);

    // so we can exit fullscreen
    fullscreenOverlay.addEventListener('click', toggleFullscreen);

    // mobile touch listeners:
    // touch start on `imgStack` to detect initial touch on top image
    // `passive: false` is essential for `ev.preventDefault()` to work
    imgStack.addEventListener('touchstart', handleStart, {passive: false});
    // touch(move|end|cancel) on `document` to capture events globally
    document.addEventListener('touchmove', handleDrag, {passive: false});
    document.addEventListener('touchend', handleEnd);
    document.addEventListener('touchcancel', handleEnd);

    // initial display setup
    updateStackDisplay();
});
