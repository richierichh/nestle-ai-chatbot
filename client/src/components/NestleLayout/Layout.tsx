import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface NestleLayoutProps {
  children: ReactNode;
}

const NestleLayout = ({ children }: NestleLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow">
        {children}
      </div>
      <Footer />
    </div>
  );
};

export default NestleLayout;