import "./Button.scss";

function Button({ name, onClick }: { name: string; onClick: () => void }) {
  return <button onClick={onClick}>{name}</button>;
}

export default Button;
