interface Props {
  icon?: React.ElementType;
  label: string;
}

const FieldLabel = ({ icon: Icon, label }: Props) => (
  <label className="mb-1 flex items-center gap-1 text-[11px] font-semibold text-[#6B7280]">
    {Icon && <Icon size={12} />}
    {label}
  </label>
);

export default FieldLabel;
