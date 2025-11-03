import Nubank from './assets/icons/card-nubank.svg';
import Itau from './assets/icons/card-itau.svg';
import Bradesco from './assets/icons/card-bradesco.svg';
import BB from './assets/icons/card-bb.svg';
import Caixa from './assets/icons/card-caixa.svg';
import Santander from './assets/icons/card-santander.svg';
import C6 from './assets/icons/card-c6.svg';

export default function Cards() {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 16,
        justifyContent: 'center',
        alignItems: 'center',
        padding: '16px',
      }}
    >
      <img src={Nubank} alt="Nubank" width={96} height={60} />
      <img src={Itau} alt="Itaú" width={96} height={60} />
      <img src={Bradesco} alt="Bradesco" width={96} height={60} />
      <img src={BB} alt="Banco do Brasil" width={96} height={60} />
      <img src={Caixa} alt="Caixa" width={96} height={60} />
      <img src={Santander} alt="Santander" width={96} height={60} />
      <img src={C6} alt="C6 Bank" width={96} height={60} />
    </div>
  );
}