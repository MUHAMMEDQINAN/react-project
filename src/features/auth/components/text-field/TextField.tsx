import './textField.scss';

type Props = {
  type: 'email'|'password';
  name: string;
  hintText: string;
};

export default function TextField({ type, name, hintText }: Props) {
  return <input type={type} name={name} placeholder={hintText}></input>;
}
