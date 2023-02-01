import { OnTransactionHandler } from '@metamask/snap-types';

// TODO: one MM snaps are in prod use bee-js instead of direct calls
// const beeUrl = 'http://localhost:1633';
// const bee = new Bee(beeUrl);

// TODO: proper reference shoul be moved to env
const SWARM_URL = 'http://localhost:1633/bzz/cc0866cd5e7245e907e40df47b1f7b9977cc4ed3a5365247a1f7a912605601e0/';

const CHESHIRE_API = 'https://api.cheshire.wtf/v1/';

export const onTransaction: OnTransactionHandler = async ({
  transaction,
  chainId,
}) => {
  const { to } = transaction;
  
  // const signer = await Utils.makeEthereumWalletSigner(window.ethereum)
      
  // const topic = '0000000000000000000000000000000000000000000000000000000000000000'
  // const feed_data = await bee.getJsonFeed(
  //   topic, 
  //   { signer: signer }
  // );
  // console.log(feed_data)
  // TODO: return fetched data instead mock 
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
  console.log(swarmArray)
  let likes = 0
  let dislikes = 0
  
  let reportsMessage = ''
  let reports = swarmArray.filter((record: any) => {
    return (record.chain_id == chainId.split(':')[1] && record.contract_address == to)
  })
  
  // TODO: enable humanity verification with soulbound tokens once provider is up again

  // SBT filtering
  // reports = await Promise.all(reports.map(async (record: any) => {
  //   try {
  //     const response = await fetch(
  //       `${CHESHIRE_API}${record.reporter_address}`,
  //       {
  //         method: 'get',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //       },
  //     );

  //     const userData = await response.json()

  //     if (userData.providers && userData.providers.length > 0) {
  //       const verifiedProviders = userData.providers.filter((provider: any) => provider.result)
  //       if (verifiedProviders.length > 0) return record 
  //     }
  //   } catch (e) {
  //     return null
  //   }
  //   return null
  // }))


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
      Likes: `${likes} 👍`, Dislikes: `${dislikes} 👎`,
      Reports: reportsMessage,
      "Visit to add review to this contract:": `http://localhost:8000/?contract_address=${to}&chain_id=${chainId.split(':')[1]}`
    },
  };
};