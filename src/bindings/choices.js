import * as ko from 'knockout';
import * as Choices from 'choices.js/public/assets/scripts/choices.min';
import 'choices.js/public/assets/styles/choices.min.css';

ko.bindingHandlers.choices = {
    init: function(element, valueAccessor) {
        let config = valueAccessor();
        let choices = new Choices(element, config);
        if (ko.isObservable(config.selector)) config.selector(choices);
        if (ko.isObservable(config.selectorExpanded)) {
            element.addEventListener(
                'showDropdown',
                function() {
                    config.selectorExpanded(true);
                }
            );
            element.addEventListener(
                'hideDropdown',
                function() {
                    config.selectorExpanded(false);
                }
            );
        }
    }
};

export default ko.bindingHandlers.choices;
