import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { type RootState } from '@/store/store';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import UserAvatar from '@/modules/shared/layouts/shared/UserAvatar';
import { Button } from '@/modules/shared/ui/shadcn/button';

const InterviewHeader: React.FC = () => {
  const router = useRouter();
  const user   = useSelector((state: RootState) => state.user.connectedUser.user);

  return (
    <header className="h-[60px] bg-white border-b border-[#d1f5e7] flex items-center justify-between px-4 md:px-8 shrink-0">
      {/* Logo */}
      <Link href="/" className="inline-flex items-center">
        <Image
          src="/images/home/logo.svg"
          alt="TalentAI"
          width={130}
          height={34}
          style={{ objectFit: 'contain' }}
          priority
        />
      </Link>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <LanguageSwitcher variant="icon" size="small" />

        {user ? (
          <UserAvatar />
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              className="rounded-[10px] border-[#d1f5e7] text-[#6b7280] text-[0.82rem] font-semibold hover:border-[#6AD39C] hover:text-[#6AD39C] hover:bg-[rgba(106,211,156,0.04)]"
              onClick={() => router.push('/login')}
            >
              Log in
            </Button>
            <Button
              size="sm"
              className="rounded-[10px] bg-[#6AD39C] text-white text-[0.82rem] font-semibold hover:bg-[#10453F]"
              onClick={() => router.push('/register')}
            >
              Sign up
            </Button>
          </>
        )}
      </div>
    </header>
  );
};

export default InterviewHeader;
