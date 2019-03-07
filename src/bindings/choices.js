import * as ko from 'knockout';
import * as Choices from 'choices.js/public/assets/scripts/choices.min';
import 'choices.js/public/assets/styles/choices.min.css';

ko.bindingHandlers.choices = {
    init: function(element, valueAccessor) {
        new Choices(element, valueAccessor());
    }
};

export default ko.bindingHandlers.choices;
