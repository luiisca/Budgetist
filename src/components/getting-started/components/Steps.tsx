import classNames from "classnames";

interface ISteps {
  maxSteps: number;
  currentStep: number;
  navigateToStep: (step: number) => void;
}

const Steps = (props: ISteps) => {
  const { maxSteps, currentStep, navigateToStep } = props;
  return (
    <div className="mt-6 space-y-2">
      <p className="text-xs font-medium text-gray-500 dark:text-dark-neutral">
        Steps {currentStep + 1} of {maxSteps}
      </p>
      <div className="flex w-full space-x-2 rtl:space-x-reverse">
        {new Array(maxSteps).fill(0).map((_s, index) => {
          return index <= currentStep ? (
            <div
              key={`step-${index}`}
              onClick={() => navigateToStep(index)}
              className={classNames(
                "h-1 w-full rounded-[1px] bg-black dark:bg-dark-accent-100",
                index < currentStep
                  ? "cursor-pointer dark:hover:bg-dark-accent-300"
                  : ""
              )}
            />
          ) : (
            <div
              key={`step-${index}`}
              className="h-1 w-full rounded-[1px] bg-black bg-opacity-25 dark:bg-dark-300"
            />
          );
        })}
      </div>
    </div>
  );
};
export { Steps };
