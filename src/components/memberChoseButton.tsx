interface MemberChoseButtonProps {
  phoneNumber: number;
  userName: string;
  isSelected: boolean;
  toggleSelection: (phoneNumber: number) => void;
}

const MemberChoseButton = ({
  phoneNumber,
  userName,
  isSelected,
  toggleSelection,
}: MemberChoseButtonProps) => {
  const handleClick = () => {
    toggleSelection(phoneNumber);
  };

  return (
    <button
      onClick={handleClick}
      className={`border border-gray-300 rounded-md px-2 ${
        isSelected ? "bg-teal-300 border-teal-300" : ""
      }`}
    >
      <p>{userName || "Loading..."}</p>
    </button>
  );
};

export default MemberChoseButton;
