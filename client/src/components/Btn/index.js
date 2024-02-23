const Button = ({
    className,
    label,
    type,
    disabled

}) => {
  return (
    <button type={type} disabled={disabled} className={`${className} bg-blue-700 text-white hover:bg-gray-700 focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium text-sm w-full text-center dark:hover:bg-gray-700  px-5 py-2.5 rounded-lg`}>{label}</button>
  );
}

export default Button