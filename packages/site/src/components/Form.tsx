import React, { useState } from 'react';
import { Bee, BeeDebug, Utils } from '@ethersphere/bee-js';
import { Button } from './Buttons';
import { IconButton, Stack, TextareaAutosize, Typography } from '@mui/material';
import ThumbDownRoundedIcon from '@mui/icons-material/ThumbDownRounded';
import ThumbUpRoundedIcon from '@mui/icons-material/ThumbUpRounded';
import { CardWrapper } from './Card';

// TODO: move to env
const beeUrl = 'http://localhost:1633';
const beeDebugUrl = 'https://gateway-proxy-bee-8-0.gateway.ethswarm.org';
const POSTAGE_STAMPS_AMOUNT = BigInt(10000);
const POSTAGE_STAMPS_DEPTH = 20;
const bee = new Bee(beeUrl);
const beeDebug = new BeeDebug(beeDebugUrl);
const selectedPostageStamp =
  '6f09f5726fdccccc5ad1e8ac7f411fff0cb8b8e89d471d3244f5ceee42c7eaab';

export const Form = () => {
  const isBrowser = typeof window !== 'undefined';

  const queryParams = new URLSearchParams(
    isBrowser ? window.location.search : '',
  );
  // const [file, setFile] = useState<File | null>(null)
  const [comment, setComment] = useState<string | null>(null);
  const [like, setLike] = useState<boolean | null>(null);

  const [link, setLink] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);


  // const handleSelectPostageStamp = (event: React.ChangeEvent<HTMLInputElement>) => { setSelectedPostageStamp(event.target.value as Address) }

  // upload json file to storage
  const handleSubmit = async () => {
    if (!selectedPostageStamp) return;
    try {
      setUploading(true);
      setLink(null);
      // const account = await getAccount();


      const signer = await Utils.makeEthereumWalletSigner(window.ethereum)
      
      // TODO: move to env
      const topic = '0000000000000000000000000000000000000000000000000000000000000000'
      const owner = '0xed7690f97d0Ba1c780C67e2b60E37baEc7db9682'
      const reference = await bee.createFeedManifest(selectedPostageStamp, 'sequence', topic, signer.address)
      console.log(reference)
      const feed_data = await bee.getJsonFeed(
        topic, 
        { signer: signer }
      );
      console.log(feed_data)

      let user_review = {
        contract_address: queryParams.get('contract_address'), // string| null
        chain_id: queryParams.get('chain_id'),
        report_msg: comment,
        liked: like, // true false
        reporter_address: signer.address, // string | null
      };

      let updated_feed = [...feed_data, user_review]
      
      const writer = bee.makeFeedWriter('sequence', topic, signer)

      let ref = await bee.setJsonFeed(
        selectedPostageStamp,
        topic, 
        updated_feed, 
        { signer: signer }
      )

      console.log(ref)
      // if (!data.contract_address || !data.reporter_address || !account) {
      //   throw new Error(
      //     'contract_address, reporter_address or account not provided',
      //   );
      // }

      // const signature = await signData([account, JSON.stringify(data)]);
      // console.log('signature', signature);
      // const { reference } = await bee.uploadFile(
      //   selectedPostageStamp,
      //   JSON.stringify({ ...data, signature }),
      // );

      // setLink(`${beeUrl}/bzz/${resp}`);
    } catch (e) {
      setError(e);
    } finally {
      setUploading(false);
    }
  };

  const onChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newComment = event.target && event.target.value && event.target.value;
    setComment(newComment);
    setError(null);
    setLink(null);
  };

  return (
    <CardWrapper fullWidth disabled={false}>
      <Typography textAlign="center" variant="h3">
        Report Contract
      </Typography>
      <Stack direction="column" spacing={2}>
        <Stack direction="row" justifyContent="space-evenly">
          <IconButton
            color={like ? 'primary' : 'inherit'}
            aria-label="upload picture"
            component="label"
            onClick={() => setLike(true)}
          >
            <ThumbUpRoundedIcon fontSize="large" />
          </IconButton>
          <IconButton
            color={!like ? 'primary' : 'inherit'}
            aria-label="upload picture"
            component="label"
            onClick={() => setLike(false)}
          >
            <ThumbDownRoundedIcon fontSize="large" />
          </IconButton>
        </Stack>

        <TextareaAutosize
          maxRows={4}
          aria-label="maximum height"
          placeholder="...comment"
          style={{ width: 'stretch-content', height: '100px' }}
          onChange={onChange}
        />

        <Button style={{ width: '100%' }} onClick={() => handleSubmit()}>
          Submit
        </Button>
      </Stack>
      <code>
        {selectedPostageStamp === null && (
          <span>Please select a postage stamp to use for the file upload</span>
        )}
        {uploading && <span>Uploading...</span>}
        {link && (
          <a href={link} target="blank">
            <Typography color="alternative">
              <span>{link}</span>
            </Typography>
          </a>
        )}
        {error && <span>{error.message}</span>}
      </code>
    </CardWrapper>
  );
};
