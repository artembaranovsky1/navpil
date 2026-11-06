import {FieldErrors} from "@/utils/expenseValidation";

// як у валідації на бекенді
export const TRIP_NAME_MAX = 60;
export const TRIP_DESCRIPTION_MAX = 500;

type TripForm = {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
}

export const validateTrip = ({name, description, startDate, endDate}: TripForm): FieldErrors => {
    const errors: FieldErrors = {};

    if (!name.trim()) {
        errors.name = ['Вкажіть назву'];
    } else if (name.trim().length > TRIP_NAME_MAX) {
        errors.name = [`Назва — до ${TRIP_NAME_MAX} символів`];
    }

    if (description.trim().length > TRIP_DESCRIPTION_MAX) {
        errors.description = [`Опис — до ${TRIP_DESCRIPTION_MAX} символів`];
    }

    if (startDate && endDate && endDate < startDate) {
        errors.endDate = ['Кінець не може бути раніше початку'];
    }

    return errors;
}
