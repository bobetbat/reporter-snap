import React, { useState, useEffect } from 'react';
import { Address, Bee, BeeDebug, PostageBatch } from '@ethersphere/bee-js';
import { Button } from './Buttons'
import { IconButton, Stack, TextareaAutosize, Typography } from '@mui/material';
import ThumbDownRoundedIcon from '@mui/icons-material/ThumbDownRounded';
import ThumbUpRoundedIcon from '@mui/icons-material/ThumbUpRounded';
import styled from 'styled-components';
import { getAccount, signData } from '../utils';
import { CardWrapper } from './Card';

const beeUrl = "https://gateway-proxy-bee-8-0.gateway.ethswarm.org"
const beeDebugUrl = "https://gateway-proxy-bee-8-0.gateway.ethswarm.org"
const POSTAGE_STAMPS_AMOUNT = BigInt(10000)
const POSTAGE_STAMPS_DEPTH = 20
const bee = new Bee(beeUrl);
const beeDebug = new BeeDebug(beeDebugUrl);
const selectedPostageStamp = "0000000000000000000000000000000000000000000000000000000000000000";

export const Form = () => {
  const queryParams = new URLSearchParams(window.location.search)
  // const [file, setFile] = useState<File | null>(null)
  const [comment, setComment] = useState<string | null>(null)
  const [like, setLike] = useState<boolean | null>(null)

  const [link, setLink] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const [postageStamps, setPostageStamps] = useState<PostageBatch[]>([])
  // const [selectedPostageStamp, setSelectedPostageStamp] = useState<Address | null>(null)
  const [loadingStamps, setLoadingStamps] = useState<boolean>(false)
  const [creatingStamp, setCreatingStamp] = useState<boolean>(false)
  const [stampError, setStampError] = useState<Error | null>(null)

  useEffect(() => {
    setLoadingStamps(true)
    beeDebug.getAllPostageBatch()
      .then((ps: PostageBatch[]) => setPostageStamps(ps))
      .catch(setStampError)
      .finally(() => setLoadingStamps(false))
  }, [])

  const createPostageStamp = async () => {
    try {
      setCreatingStamp(true)
      await beeDebug.createPostageBatch(POSTAGE_STAMPS_AMOUNT.toString(), POSTAGE_STAMPS_DEPTH)
      setCreatingStamp(false)

      setLoadingStamps(true)
      const ps = await beeDebug.getAllPostageBatch()
      setPostageStamps(ps)
      setLoadingStamps(false)
    }
    catch (e) {
      setStampError(e)
    }
  }

  const handleSelectPostageStamp = (event: React.ChangeEvent<HTMLInputElement>) => { setSelectedPostageStamp(event.target.value as Address) }

  // should upload json file to storage
  const handleSubmit = async () => {
    // console.log('data')
    if (!selectedPostageStamp) return
    try {
      setUploading(true)
      setLink(null)
      const account = await getAccount();
      let data = {
        contract_address: queryParams.get("contract_address"), // string| null
        chain_id: queryParams.get("chain_id"), // ?????
        report_msg: comment,
        liked: like, // true false
        reporter_address: account, // string | null
      }
      // console.log('data', [account, data])
      if (data.contract_address === undefined && data.reporter_address === undefined) {
        throw new Error('contract_address or reporter_address not provided')
      }

      const signature = await signData([account, JSON.stringify(data)])
      console.log('signature', signature)
      const { reference } = await bee.uploadFile(selectedPostageStamp, JSON.stringify({ ...data, signature }))
      console.log('reference', reference)
      setLink(`${beeUrl}/bzz/${reference}`)
    } catch (e) {
      setError(e)
    }
    finally {
      setUploading(false)
    }
  }


  const onChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const f = event.target && event.target.value && event.target.value
    setComment(f)
    // setFile(f)
    setError(null)
    setLink(null)
  }

  return (
    <CardWrapper fullWidth disabled={false}>
      {/* <h1>Postage stamps</h1>
      <code>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '100px 1fr 100px',
          rowGap: '5px',
          columnGap: '15px'
        }}>
          <div>Selected</div>
          <div>Batch ID</div>
          <div>Utilization</div>
        </div>
        <hr />
        {postageStamps.map(({ batchID, utilization }) =>
          <div key={batchID} style={{
            display: 'grid',
            gridTemplateColumns: '100px 1fr 100px',
            rowGap: '5px',
            columnGap: '15px'
          }}>
            <div><input type="radio" name="stamps" value={batchID} onChange={handleSelectPostageStamp} /></div>
            <div>{batchID}</div>
            <div>{utilization}</div>
          </div>)}
        <hr />
      </code>
      <button onClick={createPostageStamp}>Create new postage stamp</button> */}
      <code>
        {loadingStamps && <span>Loading postage stamps...</span>}
        {creatingStamp && <span>Creating new postage stamp...</span>}
        {stampError && <span>{stampError.message}</span>}
      </code>

      <Typography textAlign='center' variant='h3'>Report Contract</Typography>
      <Stack direction='column' spacing={2}>
        <Stack direction='row' justifyContent="space-evenly">
          <IconButton color={like ? "primary" : "inherit"} aria-label="upload picture" component="label" onClick={() => setLike(true)}>
            <ThumbUpRoundedIcon fontSize="large" />
          </IconButton>
          <IconButton color={!like ? "primary" : "inherit"} aria-label="upload picture" component="label" onClick={() => setLike(false)}>
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
        {selectedPostageStamp === null && <span>Please select a postage stamp to use for the file upload</span>}
        {uploading && <span>Uploading...</span>}
        {link && <a href={link} target="blank" >{link}</a>}
        {error && <span>{error.message}</span>}
      </code>
    </CardWrapper>
  );
}
