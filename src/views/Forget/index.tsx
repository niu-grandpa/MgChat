import { useSearchParams } from 'react-router-dom';

function Forget() {
  const [search] = useSearchParams();
  return (
    <section style={{ width: 400, height: 350 }}>
      {search.get('account')}
    </section>
  );
}

export default Forget;
