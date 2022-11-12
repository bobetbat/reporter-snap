import { OnTransactionHandler } from '@metamask/snap-types';

const SWARM_URL = 'https://gateway-proxy-bee-8-0.gateway.ethswarm.org/bzz/07f7ff4017b9a4bee4156dae4367b6adad807e71c29e8d51a6bd4aed8d3bb0ad/';
const CHESHIRE_API = 'https://api.cheshire.wtf/v1/';

export const onTransaction: OnTransactionHandler = async ({
  transaction,
  chainId,
}) => {
  const { to } = transaction;

  const response = await fetch(
    SWARM_URL,
    {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Unable to fetch from Swarm url "${chainId}": ${response.status} ${response.statusText}.`,
    );
  }

  const swarmArray = await response.json()

  let likes = 0
  let dislikes = 0
  
  let reportsMessage = ''
  let reports = swarmArray.filter((record: any) => {
    return (record.chain_id == chainId.split(':')[1] && record.contract_address == to)
  })
  
  // SBT filtering
  reports = await Promise.all(reports.map(async (record: any) => {
    try {
      const response = await fetch(
        `${CHESHIRE_API}${record.reporter_address}`,
        {
          method: 'get',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const userData = await response.json()

      if (userData.providers && userData.providers.length > 0) {
        const verifiedProviders = userData.providers.filter((provider: any) => provider.result)
        if (verifiedProviders.length > 0) return record 
      }
    } catch (e) {
      return null
    }
    return null
  }))


  reports = reports.filter((record: any) => record)
  


  reports.map((record:any) => {
    if (record.liked) {
      likes += 1
    } else {
      dislikes += 1
    }

    reportsMessage += `${record.report_msg}\n\n`

    return record.report_msg
  })


  // erecover of signature hash with SubtleCrypto


  return {
    insights: {
      Likes: `${likes} 👍`,
      Dislikes: `${dislikes} 👎`,
      Reports: reportsMessage,
      Visit: `Review this contract here: http://placehereappurl.com/?contract_address=${to}&chain_id=${chainId.split(':')[1]}`
    },
  };
};