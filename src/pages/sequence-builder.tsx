import React from 'react';
import Head from 'next/head';
import SequenceBuilder from '../components/SequenceBuilder';

const SequenceBuilderPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Sequence Builder - TalentAI</title>
        <meta name="description" content="Create automated email and LinkedIn sequences" />
      </Head>
      <SequenceBuilder />
    </>
  );
};

export default SequenceBuilderPage;