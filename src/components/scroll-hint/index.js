import * as ko from 'knockout';
import * as template from './template.html';

function ViewModel(params) {
    const scrollContent = params.getScrollContent(params.element);
    this.canScroll = ko.observable();
    const updateCanScroll = () => {
        this.canScroll(scrollContent.scrollHeight > scrollContent.clientHeight);
    };
    window.addEventListener('resize', updateCanScroll);
    updateCanScroll();
    const observer = new MutationObserver(updateCanScroll);
    observer.observe(scrollContent, { childList: true, subtree: true });
    this.scrolledToBottom = ko.observable(false);
    this.scroll = () => {
        if (this.scrolledToBottom()) {
            const duration = 200;
            const totalScrollDistance = scrollContent.scrollTop;
            let scrollY = totalScrollDistance, oldTimestamp = null;
            const step = (newTimestamp) => {
                if (oldTimestamp !== null) {
                    scrollY -= totalScrollDistance * (newTimestamp - oldTimestamp) / duration;
                    if (scrollY <= 0) return scrollContent.scrollTop = 0;
                    scrollContent.scrollTop = scrollY;
                }
                oldTimestamp = newTimestamp;
                window.requestAnimationFrame(step);
            };
            window.requestAnimationFrame(step);
        }
        else scrollContent.scrollBy({ top: 100, behavior: "smooth" });
    };

    if (scrollContent) {
        scrollContent.onscroll = () => {
            this.scrolledToBottom(
                scrollContent.scrollTop + scrollContent.offsetHeight === scrollContent.scrollHeight
            );
        };
    }
}

export default ko.components.register('scroll-hint', {
    viewModel: {
        createViewModel: function(params, component) {
            params.element = component.element;
            return new ViewModel(params);
        }
    },
    template: template
});
