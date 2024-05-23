let availableHoursLunes = ['1:00', '3:00', '5:00']

let availableHoursViernes = ['5:00']

export const getAvailableHoursViernes = () => {
  return availableHoursViernes
}

export const getAvailableHoursLunes = () => {
  return availableHoursLunes
}

export const removeHourFromLunes = (hour) => {
  availableHoursLunes = availableHoursLunes.filter(h => h !== hour);
}

export const removeHourFromViernes = (hour) => {
  availableHoursViernes = availableHoursViernes.filter(h => h !== hour);
}

